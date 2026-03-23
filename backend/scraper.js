const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Snapshot = require('./models/Snapshot');

puppeteer.use(StealthPlugin());

let browser = null;
let lastTimestamp = null;

async function scrapeNSE() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
    
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTimeMinutes = hours * 60 + minutes;
    const startTimeMinutes = 9 * 60 + 15; // 09:15
    const endTimeMinutes = 15 * 60 + 30; // 15:30

    // Market hours check (Mon-Fri)
    const day = istTime.getDay();
    if (day === 0 || day === 6 || currentTimeMinutes < startTimeMinutes || currentTimeMinutes > endTimeMinutes) {
        console.log(`[SCRAPER] Market is CLOSED. Current IST: ${istTime.toLocaleTimeString('en-IN')}`);
        // return; // Skip scraping outside market hours. Uncomment this line for production. For testing, let it pass.
    }

    console.log(`[SCRAPER] Scraping starting... IST: ${istTime.toLocaleTimeString('en-IN')}`);

    if (!browser) {
        browser = await puppeteer.launch({
            headless: false, // Visible as requested
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: ['--start-maximized']
        });
    }

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        
        await page.goto('https://www.nseindia.com/option-chain', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await page.waitForSelector('#asOnText', { visible: true, timeout: 30000 });
        const rawTimestamp = await page.evaluate(() => document.querySelector('#asOnText').innerText.trim());
        const currentTS = rawTimestamp.replace(/As on |,/g, '').trim();

        if (currentTS === lastTimestamp) {
            console.log(`[SCRAPER] Data already captured for timestamp: ${currentTS}`);
            await page.close();
            return;
        }

        console.log(`[SCRAPER] New timestamp detected: ${currentTS}. Processing data...`);

        // Wait for table container
        await page.waitForSelector('#optionChainTableContainer', { visible: true, timeout: 30000 });
        
        const scrapeData = await page.evaluate(() => {
            const table = document.querySelector('#optionChainTableContainer table');
            if (!table) return null;

            const rows = Array.from(table.querySelectorAll('tbody tr')).slice(0, 150); // Get top 150 rows as requested
            
            return rows.map(row => {
                const cols = row.querySelectorAll('td');
                if (cols.length < 21) return null;
                
                return {
                    strikePrice: parseFloat(cols[11]?.innerText.replace(/,/g, '')), // Strike price is usually at index 11
                    ceOI: parseInt(cols[1]?.innerText.replace(/,/g, '')) || 0,
                    ceLTP: parseFloat(cols[5]?.innerText.replace(/,/g, '')) || 0,
                    peOI: parseInt(cols[21]?.innerText.replace(/,/g, '')) || 0, // Pe OI at end indices
                    peLTP: parseFloat(cols[17]?.innerText.replace(/,/g, '')) || 0
                };
            }).filter(d => d !== null);
        });

        // Get expiry date from dropdown
        const expiryDate = await page.evaluate(() => {
            const dropdown = document.querySelector('#expirySelect');
            return dropdown ? dropdown.options[dropdown.selectedIndex].text : 'N/A';
        });

        const marketDate = new Date().toISOString().split('T')[0];

        if (scrapeData && scrapeData.length > 0) {
            const snapshot = new Snapshot({
                marketDate,
                timestamp: currentTS,
                expiryDate,
                data: scrapeData
            });

            await snapshot.save();
            console.log(`[SCRAPER] Successfully saved snapshot for ${currentTS}`);
            lastTimestamp = currentTS;
        }

        await page.close();
    } catch (err) {
        console.error(`[SCRAPER] Error: ${err.message}`);
    } finally {
        if (browser) {
            // Keep browser open for visible debugging if needed, 
            // but for a background scraper, we should close it to save resources.
            // await browser.close(); 
            // browser = null;
        }
    }
}

module.exports = { scrapeNSE };
