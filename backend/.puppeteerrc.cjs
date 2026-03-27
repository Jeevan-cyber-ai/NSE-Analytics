const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to be within the project directory
  // so Render can cache it during build properly.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
