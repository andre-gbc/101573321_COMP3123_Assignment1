const fs = require("fs");
const path = require("path");

const logDirectory = path.join(__dirname, "..", "logs");
const logFile = path.join(logDirectory, "application.log");

function log(message) {
  fs.mkdirSync(logDirectory, { recursive: true });

  const line = `${new Date().toISOString()} ${message}\n`;

  fs.appendFile(logFile, line, (error) => {
    if (error) {
      console.error("Could not write to log file");
    }
  });
}

module.exports = log;