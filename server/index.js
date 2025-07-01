const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const Parser    = require("rss-parser");
const Sentiment = require("sentiment");
const parser    = new Parser();
const sentiment = new Sentiment();

const app = express();
const server = http.createServer(app);

// Enable CORS for your React app
app.use(cors());

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Basic health-check endpoint
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// When clients connect
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Store last prices so we can compute deltas
let previousPrices = {};

// Fetch top-50 futures from Binance and broadcast
const fetchAndBroadcastPrices = async () => {
  try {
    const res = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr');
    console.log('🔄 Fetched', res.data.length, 'coins from Binance');

    const top50 = res.data
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 50)
      .map((coin) => {
        const symbol = coin.symbol;
        const price = parseFloat(coin.lastPrice);
        const percentChange = parseFloat(coin.priceChangePercent);
        const delta = previousPrices[symbol] != null
          ? price - previousPrices[symbol]
          : 0;
        previousPrices[symbol] = price;
        return { symbol, price, percentChange, delta };
      });

    // Broadcast to all connected clients
    io.emit('priceUpdate', top50);
  } catch (err) {
    console.error('❌ Error fetching Binance data:', err.message);
  }
};

// Fire once immediately, then every 5s
fetchAndBroadcastPrices();
setInterval(fetchAndBroadcastPrices, 5000);

app.get("/news/:symbol", async (req, res) => {
  const symbol = req.params.symbol.replace(/USDT$/, "");
  console.log(`→ Fetching news & sentiment for ${symbol}`);

  try {
    // 1) Fetch RSS feed
    const feed = await parser.parseURL("https://cryptonews.com/news/feed");

    // 2) Filter & pick top 5 headlines mentioning the symbol
    const articles = feed.items
      .filter(item =>
        item.title.toUpperCase().includes(symbol.toUpperCase())
      )
      .slice(0, 5)
      .map(item => item.title);

    console.log(`Found ${articles.length} articles:`, articles);

    // 3) Compute sentiment score for each headline
    const scores = articles.map(title => sentiment.analyze(title).score);
    console.log("Sentiment scores:", scores);

    // 4) Aggregate to a simple prediction
    const avg = scores.reduce((sum, s) => sum + s, 0) / (scores.length || 1);
    let prediction;
    if (avg > 0.5) prediction = "Predicted trend: likely to rise 📈";
    else if (avg < -0.5) prediction = "Predicted trend: likely to fall 📉";
    else prediction = "Predicted trend: likely to stay stable ➖";

    // 5) Return both headlines and your “AI” prediction
    return res.json({ articles, prediction });

  } catch (err) {
    console.error("❌ News/sentiment error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
