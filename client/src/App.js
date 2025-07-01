import React, { useEffect, useState } from "react";
import socket from "./socket";

function App() {
  const [coins, setCoins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState({ articles: [], prediction: "" });
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    socket.on("priceUpdate", (data) => {
      console.log("Received coins:", data);
      setCoins(data);
    });

    return () => {
      socket.off("priceUpdate");
    };
  }, []);

  useEffect(() => {
    if (!selected) return;

    console.log("🌐 Fetching details for", selected);
    setLoadingDetails(true);

    fetch(`http://localhost:4000/news/${selected}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📬 Details received:", data);
        setDetails({
          articles: Array.isArray(data.articles) ? data.articles : [],
          prediction:
            typeof data.prediction === "string" ? data.prediction : "",
        });
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setDetails({ articles: [], prediction: "Error loading details." });
      })
      .finally(() => setLoadingDetails(false));
  }, [selected]);

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
            const deltaColor =
              coin.delta >= 0 ? "text-green-600" : "text-red-600";
            const pctColor =
              coin.percentChange >= 0 ? "text-green-600" : "text-red-600";

            return (
              <tr
                key={coin.symbol}
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelected(coin.symbol)}
              >
                <td className="p-2">{coin.symbol}</td>
                <td className="p-2 text-right">{coin.price.toFixed(2)}</td>
                <td className={`p-2 text-right ${deltaColor}`}>
                  {coin.delta >= 0 ? "+" : ""}
                  {coin.delta.toFixed(2)}
                </td>
                <td className={`p-2 text-right ${pctColor}`}>
                  {coin.percentChange >= 0 ? "+" : ""}
                  {coin.percentChange.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "100%",
              position: "relative",
            }}
          >
            <button
              onClick={() => setSelected(null)}
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                background: "transparent",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <h2 style={{ marginBottom: "1rem" }}>{selected} Details</h2>

            {loadingDetails ? (
              <p>Loading…</p>
            ) : (
              <>
                <h3>News Headlines:</h3>
                {Array.isArray(details.articles) &&
                details.articles.length > 0 ? (
                  <ul style={{ paddingLeft: "1.2rem" }}>
                    {details.articles.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No recent headlines found.</p>
                )}

                <h3 style={{ marginTop: "1rem" }}>24h Prediction:</h3>
                <p>{details.prediction}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
