const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const WebSocket  = require('ws');
const Parser     = require('rss-parser');
const Sentiment  = require('sentiment');

const parser    = new Parser();
const sentiment = new Sentiment();

const app    = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: [
  'http://localhost:3000',
  'https://coruscating-elf-c2460f.netlify.app'
];
    methods: ['GET','POST']
  }
});

// Health-check endpoint
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Socket.IO connection handler
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

let previousPrices = {};

// Connect to Binance futures combined ticker WebSocket
const bws = new WebSocket('wss://fstream.binance.com/ws/!ticker@arr');

bws.on('message', msg => {
  try {
    const data = JSON.parse(msg);  // array of ticker objects
    const top50 = data
      .sort((a, b) => parseFloat(b.a) - parseFloat(a.a)) // a = quoteVolume
      .slice(0, 50)
      .map(t => {
        const symbol        = t.s;                       // symbol
        const price         = parseFloat(t.c);           // lastPrice
        const percentChange = parseFloat(t.P);           // priceChangePercent
        const delta         = previousPrices[symbol] != null
          ? price - previousPrices[symbol]
          : 0;
        previousPrices[symbol] = price;
        return { symbol, price, percentChange, delta };
      });
    io.emit('priceUpdate', top50);
  } catch (err) {
    console.error('Error processing WS message:', err);
  }
});

bws.on('error', err => {
  console.error('Binance WS error:', err);
});

// News + sentiment endpoint using Google News RSS
app.get('/news/:symbol', async (req, res) => {
  const base = req.params.symbol.replace(/USDT|USDC$/, '').toUpperCase();
  console.log(`Fetching news for ${base}`);
  try {
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(base)}`;
    const feed    = await parser.parseURL(feedUrl);
    const articles = feed.items.slice(0, 5).map(item => item.title);

    const scores = articles.map(title => sentiment.analyze(title).score);
    const avg    = scores.reduce((sum, s) => sum + s, 0) / (scores.length || 1);

    let prediction;
    let icon;
    if (avg > 0.5) {
      prediction = 'Predicted trend: likely to rise';
      icon       = 'arrow-up';
    } else if (avg < -0.5) {
      prediction = 'Predicted trend: likely to fall';
      icon       = 'arrow-down';
    } else {
      prediction = 'Predicted trend: likely to stay stable';
      icon       = 'minus';
    }

    return res.json({ articles, prediction, icon });
  } catch (err) {
    console.error('News/sentiment error:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
