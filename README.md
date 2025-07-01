# Binance Futures Tracker

## Overview

Binance Futures Tracker is a full-stack real-time web application that displays live prices for the top 50 futures contracts on Binance. It provides:

* **Real-time price updates** via a server-side WebSocket feed (no client polling).
* **Price delta** since last update and **24-hour percentage change**, color-coded for clarity.
* **News headlines** fetched dynamically from Google News RSS for each asset.
* **Local sentiment analysis** on recent headlines to predict whether the price is likely to **rise**, **fall**, or **stay stable** over the next 24 hours.

Built with React on the frontend and Node.js + Express + `socket.io` on the backend.

---

## Features

1. **Live Price Table**

   * Top 50 Binance futures sorted by quote volume.
   * Columns: Symbol, Price (USD), Δ since last, 24h %.
   * Color-coded: green for positive, red for negative changes.

2. **News & Prediction Modal**

   * Click any row to open a modal.
   * Displays the 5 most recent news headlines mentioning that asset from Google News RSS.
   * Runs local sentiment analysis on headlines to compute a one-line prediction (rise/fall/stable). Icons indicate trend.

---

## Local Setup

### Prerequisites

* **Node.js** v14 or newer
* **npm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd binance-futures-tracker
```

### 2. Install Server Dependencies

```bash
cd server
npm install express cors socket.io ws rss-parser sentiment
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install react react-dom react-icons socket.io-client
```

### 4. Run the Server

```bash
cd ../server
npm start   # or nodemon index.js if you have nodemon installed
```

The server will start on **[http://localhost:4000](http://localhost:4000)** and connect to Binance’s WebSocket feed.

### 5. Run the Client

```bash
cd ../client
npm start
```

The React app will open in your default browser at **[http://localhost:3000](http://localhost:3000)**.

---

