import React, { useEffect, useState } from 'react';
import socket from './socket';

function App() {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    socket.on('priceUpdate', (data) => {
      console.log('Received coins:', data);
      setCoins(data);
    });

    return () => {
      socket.off('priceUpdate');
    };
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Binance Futures Tracker</h1>

      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Symbol</th>
            <th className="text-right p-2">Price (USD)</th>
            <th className="text-right p-2">Δ since last</th>
            <th className="text-right p-2">24h %</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => {
            const deltaColor = coin.delta >= 0 ? 'text-green-600' : 'text-red-600';
            const pctColor   = coin.percentChange >= 0 ? 'text-green-600' : 'text-red-600';

            return (
              <tr key={coin.symbol} className="hover:bg-gray-100">
                <td className="p-2">{coin.symbol}</td>
                <td className="p-2 text-right">
                  {coin.price.toFixed(2)}
                </td>
                <td className={`p-2 text-right ${deltaColor}`}>
                  {coin.delta >= 0 ? '+' : ''}{coin.delta.toFixed(2)}
                </td>
                <td className={`p-2 text-right ${pctColor}`}>
                  {coin.percentChange >= 0 ? '+' : ''}{coin.percentChange.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
