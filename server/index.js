const axios = require('axios');

let previousPrices = {}; // To calculate delta

const fetchAndBroadcastPrices = async () => {
  try {
    const res = await axios.get('https://fapi.binance.com/fapi/v1/ticker/24hr');
    
    // Sort by quoteVolume descending & take top 50
    const top50 = res.data
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 50)
      .map((coin) => {
        const symbol = coin.symbol;
        const price = parseFloat(coin.lastPrice);
        const percentChange = parseFloat(coin.priceChangePercent);
        const delta = previousPrices[symbol]
          ? price - previousPrices[symbol]
          : 0;

        // Save current price for next round
        previousPrices[symbol] = price;

        return {
          symbol,
          price,
          percentChange,
          delta,
        };
      });

    // Emit to all connected clients
    io.emit('priceUpdate', top50);

  } catch (error) {
    console.error('Error fetching Binance data:', error.message);
  }
};

// Poll every 5 seconds internally
setInterval(fetchAndBroadcastPrices, 5000);
