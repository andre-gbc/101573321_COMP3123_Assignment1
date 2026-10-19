require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const log = require("./utils/logger");

const app = express();
const port = process.env.PORT || 3000;

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

app.use((req, res, next) => {
  res.on("finish", () => {
    log(`${req.method} ${req.path} ${res.statusCode}`);
  });

  next();
});

app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/user", authLimiter, userRoutes);
app.use("/api/v1/emp", employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }

  log("Application error");
  res.status(500).json({ message: "Internal server error" });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      log(`Server started on port ${port}`);
    });
  })
  .catch(() => {
    console.error("Could not connect to MongoDB");
    log("MongoDB connection failed");
  });