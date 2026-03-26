require('dotenv').config();
const { scrapeNSE } = require('./scraper');

async function test() {
    console.log('--- TEST RUN START ---');
    console.log('Executable Path from ENV:', process.env.PUPPETEER_EXECUTABLE_PATH);
    try {
        await scrapeNSE();
    } catch (e) {
        console.error('--- EXCEPTION ---');
        console.error(e);
    }
    console.log('--- TEST RUN END ---');
}

test();
