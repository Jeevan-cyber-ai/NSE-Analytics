# NSE Analytics Dashboard 📈

A real-time NSE Option Chain analytics dashboard built using the MERN stack. It features a Puppeteer-based scraper to fetch live data from the National Stock Exchange (NSE) and persists it in MongoDB for historical analysis.

## 🚀 Features

-   **Live Data Scraping**: Automated fetching of NSE Option Chain data every 60 seconds.
-   **Historical Analytics**: Store and retrieve snapshots for different market dates and timestamps.
-   **Smart Visuals**: ATM (At-the-Money) highlighting and PCR (Put-Call Ratio) calculations.
-   **Robust Backend**: Express.js server with Mongoose integration.
-   **Modern Frontend**: React dashboard powered by Vite and styled with Tailwind CSS.
-   **Development Friendly**: Seamless fallback to mock data if the database or NSE website is unreachable.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Lucide React, Axios.
-   **Backend**: Node.js, Express, Puppeteer (with Stealth Plugin), Mongoose.
-   **Database**: MongoDB (Atlas).
-   **Scheduling**: `setInterval` & `node-cron` prepared for automated tasks.

## 📁 Project Structure

```text
├── backend/            # Express server & Scraper logic
│   ├── models/         # Mongoose schemas (Snapshot.js)
│   ├── server.js       # Main server entry point
│   ├── scraper.js      # Puppeteer scraping logic
│   └── .env            # Environment variables (Internal)
├── frontend/           # React application
│   ├── src/            # Components, styles, and logic
│   ├── tailwind.config # Styling configuration
│   └── vite.config.js  # Vite configuration
├── debug_nse.js        # Scraper debugging utility
├── nse_analytics.js    # Core analytics and data processing logic
└── root/               # Root configuration files

```

## ⚙️ Installation

### Prerequisites
-   Node.js (v18+)
-   MongoDB Atlas Account

### Steps

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd NSE
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    ```

3.  **Setup Frontend**:
    ```bash
    cd ../frontend
    npm install
    ```

## 🏃 Running the Application

### 1. Start Backend
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000` and initiate the first scrape immediately.

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

## 🛡️ Scraper Security
The backend utilizes `puppeteer-extra` with the `stealth` plugin to bypass common bot detection on the NSE website, ensuring reliable data ingestion.

## 📄 License
MIT License
