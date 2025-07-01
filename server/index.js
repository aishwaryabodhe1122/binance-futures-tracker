const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

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

// Start server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
