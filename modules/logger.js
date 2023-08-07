// logger.js
const fs = require('fs');

function logMessage(message, response) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] User: ${message.author.username} | Content: ${message.content} | Bot: ${response}\n`;
  fs.appendFile('log.txt', logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

module.exports = { logMessage };
