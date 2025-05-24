require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.get("/", (req, res) => res.send("Backend server is running!"));

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
