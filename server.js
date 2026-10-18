require("dotenv").config();

const express = require("express");
const helmet = require("helmet");

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});