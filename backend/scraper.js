const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const Snapshot = require('./models/Snapshot');

puppeteer.use(StealthPlugin());

let lastTimestamp = null;
let browser = null;

async function scrapeNSE() {
    const istTimeString = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istTime = new Date(istTimeString);
    console.log(`[SCRAPER] ── Run at IST: ${istTime.toLocaleTimeString('en-IN')} ──`);

    if (!browser || !browser.isConnected()) {
        console.log(`[SCRAPER] 🚀 Launching new browser instance...`);
        browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.RENDER ? undefined : (process.env.PUPPETEER_EXECUTABLE_PATH || undefined),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });
    }

    const page = await browser.newPage();
    try {
        await page.setCacheEnabled(false);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

        let apiPacket = null;

        page.on('response', async (res) => {
            const url = res.url();
            // Match any NSE API response related to option chain (v3 or other variants)
            if (url.includes('nseindia.com/api/') && url.includes('option') && res.status() === 200) {
                try {
                    const data = await res.json();
                    const rowCount = Array.isArray(data?.records?.data) ? data.records.data.length : -1;
                    // Only capture the FIRST valid packet with actual strike data
                    if (!apiPacket && rowCount > 0) {
                        console.log(`[SCRAPER] Intercepted Packet from: ${url.split('?')[0]}`);
                        apiPacket = data;
                    }
                } catch (e) {
                    // Ignore non-JSON responses
                }
            }
        });

        console.log('[SCRAPER] Navigating to Option Chain Page...');
        await page.goto('https://www.nseindia.com/option-chain', {
            waitUntil: 'networkidle0',
            timeout: 90000
        });

        // Wait up to 15s for the packet
        for (let i = 0; i < 15 && !apiPacket; i++) {
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!apiPacket || !apiPacket.records || !Array.isArray(apiPacket.records.data)) {
            console.error('[SCRAPER] ❌ Failed to intercept API packet. Retrying on next interval.');
            return;
        }

        const currentTS = apiPacket.records.timestamp;
        if (currentTS === lastTimestamp) {
            console.log(`[SCRAPER] Data for ${currentTS} already stored.`);
            return;
        }

        const allExpiryDates = apiPacket.records.expiryDates || [];
        const maxExpiries = Math.min(allExpiryDates.length, 4); // Capture up to nearest 4 expiries
        console.log(`[SCRAPER] Discovered ${allExpiryDates.length} expiries. Will scrape the nearest ${maxExpiries}.`);

        // We already have the first expiry data in `apiPacket`
        let packetsToProcess = [apiPacket];

        // Fetch remaining nearest expiries directly using page.evaluate
        for (let i = 1; i < maxExpiries; i++) {
            const expDate = allExpiryDates[i];
            console.log(`[SCRAPER] Fetching data for expiry: ${expDate} ...`);
            try {
                const nextPacket = await page.evaluate(async (expiry) => {
                    const res = await fetch(`https://www.nseindia.com/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=${expiry}`);
                    return await res.json();
                }, expDate);

                if (nextPacket && nextPacket.records && Array.isArray(nextPacket.records.data)) {
                    // Inject the correct expiry dates root field so our mapper doesn't fail
                    nextPacket.records.expiryDates = allExpiryDates;
                    packetsToProcess.push(nextPacket);
                }
                // Delay 1 second to avoid NSE rate limiting
                await new Promise(r => setTimeout(r, 1000));
            } catch (fetchErr) {
                console.warn(`[SCRAPER] ⚠️ Failed fetching expiry ${expDate}:`, fetchErr.message);
            }
        }

        const year = String(istTime.getFullYear());
        const month = String(istTime.getMonth() + 1).padStart(2, '0');
        const day = String(istTime.getDate()).padStart(2, '0');
        const marketDate = `${year}-${month}-${day}`;
        let totalStrikesSaved = 0;

        for (let i = 0; i < packetsToProcess.length; i++) {
            const packet = packetsToProcess[i];
            // Enforce the standard DD-MMM-YYYY format from allExpiryDates to prevent format mismatches
            const expiryDate = allExpiryDates[i] || 'N/A';
            const underlyingValue = packet.records.underlyingValue;

            const dataRows = packet.records.data
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
                    ceBidQty: r.CE?.buyQuantity1 || 0,
                    ceBid: r.CE?.buyPrice1 || 0,
                    ceAsk: r.CE?.sellPrice1 || 0,
                    ceAskQty: r.CE?.sellQuantity1 || 0,
                    // PE (Puts)
                    peBidQty: r.PE?.buyQuantity1 || 0,
                    peBid: r.PE?.buyPrice1 || 0,
                    peAsk: r.PE?.sellPrice1 || 0,
                    peAskQty: r.PE?.sellQuantity1 || 0,
                    peChng: r.PE?.change || 0,
                    peLTP: r.PE?.lastPrice || 0,
                    peIV: r.PE?.impliedVolatility || 0,
                    peVolume: r.PE?.totalTradedVolume || 0,
                    peChngOI: r.PE?.changeinOpenInterest || 0,
                    peOI: r.PE?.openInterest || 0
                }));

            if (dataRows.length > 0 && expiryDate !== 'N/A') {
                await Snapshot.create({ marketDate, timestamp: currentTS, expiryDate, underlyingValue, data: dataRows });
                totalStrikesSaved += dataRows.length;
                console.log(`[SCRAPER] ✅ SAVED [${expiryDate}]: ${currentTS} (${dataRows.length} strikes)`);
            }
        }

        lastTimestamp = currentTS;
        console.log(`[SCRAPER] 🎉 Finished persisting total ${totalStrikesSaved} strikes across ${packetsToProcess.length} expiries for TS: ${currentTS}`);

    } catch (err) {
        console.error(`[SCRAPER] ❌ Error: ${err.message}`);
    } finally {
        await page.close();
    }
}

module.exports = { scrapeNSE };
