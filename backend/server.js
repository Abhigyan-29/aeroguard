const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const eventRoutes = require("./routes/eventsRoutes");
const authRoutes = require("./routes/authRoutes");
const newsRoutes = require("./routes/newsRoutes");

app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);

app.get("/", (req, res) => {
  res.send("TerraPulse API Running with MongoDB Integration");
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/terrapulse";

// Graceful Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 MongoDB Connected successfully to " + MONGO_URI))
  .catch((err) => console.log("🟠 MongoDB Connection failed (API will run without auth features):", err.message));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Initialize Cron Jobs after server spins up
  require("./services/alertService");
});