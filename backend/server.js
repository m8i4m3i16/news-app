require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const csrf = require("csurf");

const app = express();
const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin: ["http://localhost:5173", "http://your-frontend-deployment-url.com"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "a-very-strong-secret-key-for-session",
    resave: false,
    saveUninitialized: true, // 可設 false，如果不想為未修改的 session 創建記錄
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
const csrfProtection = csrf({ cookie: true });

app.get("/api/rain-data", async (req, res) => {
  try {
    const apiUrl =
      "https://wic.heo.taipei/OpenData/API/Rain/Get?stationNo=&loginId=open_rain&dataKey=85452C1D";
    const response = await axios.get(apiUrl);

    if (response.data && Array.isArray(response.data.data)) {
      res.json(response.data.data);
    } else if (
      response.data &&
      response.data.data === null &&
      response.data.count === 0
    ) {
      res.json([]);
    } else {
      console.error(
        "Unexpected API response structure from wic.heo.taipei. Expected 'response.data.data' to be an array. Actual response.data:",
        response.data
      );
      res.status(500).json({
        message: "Unexpected API response structure from wic.heo.taipei",
      });
    }
  } catch (error) {
    console.error(
      "Error fetching rain data from wic.heo.taipei:",
      error.message
    );
    if (error.response) {
      res.status(error.response.status).json({
        message:
          error.response.data && error.response.data.Message
            ? error.response.data.Message
            : error.response.data && error.response.data.message
            ? error.response.data.message
            : "Failed to fetch rain data from external API",
      });
    } else if (error.request) {
      res
        .status(504)
        .json({ message: "No response from external API (gateway timeout)" });
    } else {
      res
        .status(500)
        .json({ message: "Error setting up request to external API" });
    }
  }
});

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post("/api/submit-something", csrfProtection, (req, res) => {
  console.log("Received data:", req.body);
  res
    .status(200)
    .json({ message: "Data received successfully (CSRF Protected)" });
});

app.get("/", (req, res) => res.send("Backend server is running!"));

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.warn("CSRF Token Error:", err.message);
    res.status(403).json({ message: "Invalid CSRF token. Forbidden." });
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
