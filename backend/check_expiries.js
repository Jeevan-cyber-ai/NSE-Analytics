const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
require('dotenv').config();
puppeteer.use(StealthPlugin());

async function checkExpiries() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ 
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // We will collect ALL API responses
    const allPackets = [];
    
    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('api/option-chain') && res.status() === 200) {
            try {
                const data = await res.json();
                if (data && data.records && data.records.data) {
                    console.log(`Intercepted API for URL: ${url}`);
                    const expiries = new Set(data.records.data.map(d => d.expiryDate || d.expiryDates));
                    console.log(`Contains Expiries:`, [...expiries]);
                    allPackets.push(data);
                }
            } catch(e) {}
        }
    });

    console.log("Navigating to NSE...");
    await page.goto('https://www.nseindia.com/option-chain', { waitUntil: 'networkidle0', timeout: 90000 });
    
    // Check if the dropdown exists
    const selectExists = await page.$('select#expirySelect');
    console.log("Dropdown exists:", !!selectExists);
    
    if (selectExists) {
        // give it a moment to render options
        await new Promise(r => setTimeout(r, 2000));
        const options = await page.$$eval('select#expirySelect option', opts => opts.map(o => o.value).filter(val => val));
        console.log("Available Expiry Options:", options);
        
        // Select the second expiry option if available
        if (options.length > 1) {
            console.log(`Selecting expiry: ${options[1]}`);
            await page.select('select#expirySelect', options[1]);
            // Wait for new API call
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    await browser.close();
    console.log("Done checking.");
}

checkExpiries().catch(console.error);
