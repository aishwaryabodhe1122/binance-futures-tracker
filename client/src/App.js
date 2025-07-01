import React, { useEffect, useState } from 'react';
import socket from './socket';

function App() {
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    socket.on('priceUpdate', (data) => {
      console.log('Received data:', data);
      setPriceData(data);
    });

    // Optional: Clean up the socket on unmount
    return () => {
      socket.off('priceUpdate');
    };
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Binance Futures Tracker</h1>
      {priceData ? (
        <div>
          <h2>{priceData.symbol}</h2>
          <p>Current Price: ${priceData.price}</p>
        </div>
      ) : (
        <p>Waiting for price data...</p>
      )}
    </div>
  );
}

export default App;
