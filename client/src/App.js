import React, { useEffect, useState } from "react";
import socket from "./socket";
import { FaArrowUp, FaArrowDown, FaMinus } from "react-icons/fa";

function App() {
  const [coins, setCoins] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState({
    articles: [],
    prediction: "",
    icon: "",
  });
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    socket.on("priceUpdate", (data) => setCoins(data));
    return () => socket.off("priceUpdate");
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingDetails(true);
    fetch(`http://localhost:4000/news/${selected}`)
      .then((res) => res.json())
      .then((data) => {
        setDetails({
          articles: Array.isArray(data.articles) ? data.articles : [],
          prediction:
            typeof data.prediction === "string" ? data.prediction : "",
          icon: data.icon || "",
        });
      })
      .catch(() =>
        setDetails({
          articles: [],
          prediction: "Error loading details.",
          icon: "",
        })
      )
      .finally(() => setLoadingDetails(false));
  }, [selected]);

  const styles = {
    app: {
      fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#121212",
      color: "#E0E0E0",
      minHeight: "100vh",
      padding: "2rem",
    },
    header: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "1.5rem",
      color: "#FFD700",
      display: "flex",
      justifyContent: "center",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      padding: "0.75rem",
      backgroundColor: "#1F1F1F",
      borderBottom: "2px solid #333",
    },
    td: {
      padding: "0.75rem",
      textAlign: "right",
      borderBottom: "1px solid #2A2A2A",
    },
    row: {
      cursor: "pointer",
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "#1E1E1E",
      padding: "2rem",
      borderRadius: "8px",
      maxWidth: "600px",
      width: "90%",
      color: "#E0E0E0",
      position: "relative",
    },
    closeBtn: {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      background: "transparent",
      border: "none",
      fontSize: "1.2rem",
      color: "#E0E0E0",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.header}>Binance Futures Tracker</h1>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Symbol</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Price (USD)</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Δ since last</th>
            <th style={{ ...styles.th, textAlign: "right" }}>24h %</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin, idx) => (
            <tr
              key={coin.symbol}
              style={styles.row}
              onClick={() => setSelected(coin.symbol)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1A1A1A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <td style={{ ...styles.td, textAlign: "left" }}>{coin.symbol}</td>
              <td style={styles.td}>{coin.price.toFixed(2)}</td>
              <td
                style={{
                  ...styles.td,
                  color: coin.delta >= 0 ? "#4CAF50" : "#F44336",
                }}
              >
                {coin.delta >= 0 ? "+" : ""}
                {coin.delta.toFixed(2)}
              </td>
              <td
                style={{
                  ...styles.td,
                  color: coin.percentChange >= 0 ? "#4CAF50" : "#F44336",
                }}
              >
                {coin.percentChange >= 0 ? "+" : ""}
                {coin.percentChange.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button style={styles.closeBtn} onClick={() => setSelected(null)}>
              ×
            </button>
            <h2>{selected} Details</h2>

            {loadingDetails ? (
              <p>Loading…</p>
            ) : (
              <>
                <h3>News Headlines:</h3>
                {details.articles.length > 0 ? (
                  <ul>
                    {details.articles.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No recent headlines found.</p>
                )}

                <h3>24h Prediction:</h3>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {details.icon === "arrow-up" && <FaArrowUp color="#4CAF50" />}
                  {details.icon === "arrow-down" && (
                    <FaArrowDown color="#F44336" />
                  )}
                  {details.icon === "minus" && <FaMinus color="#FFC107" />}
                  {details.prediction}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
