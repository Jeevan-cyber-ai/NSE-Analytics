const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Snapshot = require('./models/Snapshot');

puppeteer.use(StealthPlugin());

let lastTimestamp = null;
let browser = null;

async function scrapeNSE() {
    const istTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000) + (new Date().getTimezoneOffset() * 60000));
    console.log(`[SCRAPER] ── Run at IST: ${istTime.toLocaleTimeString('en-IN')} ──`);

    if (!browser) {
        console.log(`[SCRAPER] 🚀 Launching new browser instance...`);
        browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // Standard for Render
                '--disable-gpu'
            ]
        });
    }


    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        
        let apiPacket = null;

        // Set up interception
        await page.setRequestInterception(false); // We don't need to intercept the request, just the response

        page.on('response', async (res) => {
            const url = res.url();
            // Be more flexible with the URL, as it might have dynamic tokens
            if (url.includes('/api/') && url.includes('option') && res.status() === 200) {
                try {
                    const data = await res.json();
                    if (data && data.records) {
                        console.log(`[SCRAPER] Intercepted Packet from: ${url.split('?')[0]}`);
                        apiPacket = data;
                    }
                } catch (e) {
                    // Ignore non-json and errors
                }
            }
        });

        // Visit NSE page which triggers the API call
        console.log('[SCRAPER] Navigating to Option Chain Page...');
        await page.goto('https://www.nseindia.com/option-chain', { 
            waitUntil: 'networkidle0', 
            timeout: 90000 
        });

        // Wait for the packet to be captured
        for(let i=0; i<15 && !apiPacket; i++) {
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!apiPacket || !apiPacket.records) {
            console.error('[SCRAPER] ❌ Failed to intercept API packet. Retrying on next interval.');
            return;
        }

        const currentTS = apiPacket.records.timestamp;
        if (currentTS === lastTimestamp) {
            console.log(`[SCRAPER] Data for ${currentTS} already stored.`);
            return;
        }

        const rows = apiPacket.filtered?.data || apiPacket.records.data;
        const expiryDate = rows[0]?.expiryDate || 'N/A';
        const underlyingValue = apiPacket.records.underlyingValue;

        const dataRows = rows
            .filter(r => r.strikePrice)
            .map(r => ({
                strikePrice: r.strikePrice,
                // CE (Calls)
                ceOI: r.CE?.openInterest || 0,
                ceChngOI: r.CE?.changeinOpenInterest || 0,
                ceVolume: r.CE?.totalTradedVolume || 0,
                ceIV: r.CE?.impliedVolatility || 0,
                ceLTP: r.CE?.lastPrice || 0,
                ceChng: r.CE?.change || 0,
                ceBidQty: r.CE?.bidQty || 0,
                ceBid: r.CE?.bidprice || 0,
                ceAsk: r.CE?.askPrice || 0,
                ceAskQty: r.CE?.askQty || 0,
                // PE (Puts)
                peBidQty: r.PE?.bidQty || 0,
                peBid: r.PE?.bidprice || 0,
                peAsk: r.PE?.askPrice || 0,
                peAskQty: r.PE?.askQty || 0,
                peChng: r.PE?.change || 0,
                peLTP: r.PE?.lastPrice || 0,
                peIV: r.PE?.impliedVolatility || 0,
                peVolume: r.PE?.totalTradedVolume || 0,
                peChngOI: r.PE?.changeinOpenInterest || 0,
                peOI: r.PE?.openInterest || 0
            }));

        const marketDate = istTime.toISOString().split('T')[0];
        const snapshot = new Snapshot({ marketDate, timestamp: currentTS, expiryDate, underlyingValue, data: dataRows });
        await snapshot.save();

        lastTimestamp = currentTS;
        console.log(`[SCRAPER] ✅ SAVED PACKET: ${currentTS} (${dataRows.length} strikes)`);

    } catch (err) {
        console.error(`[SCRAPER] ❌ Error: ${err.message}`);
    } finally {
        await page.close();
    }
}

module.exports = { scrapeNSE };
