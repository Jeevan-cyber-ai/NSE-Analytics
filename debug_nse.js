const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function debugNSE() {
    console.log("🚀 Launching Browser for Debugging...");

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    try {
        await page.goto('https://www.nseindia.com/option-chain', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds

        // Take screenshot
        await page.screenshot({ path: 'debug_page.png' });
        console.log("Screenshot saved as 'debug_page.png'");

        // Get all elements with text that might be timestamps
        const elements = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            const results = [];
            for (let el of allElements) {
                if (el.textContent && (el.textContent.includes('As on') || el.textContent.includes('as on') || /\d{1,2}:\d{2}:\d{2}/.test(el.textContent))) {
                    results.push({
                        tag: el.tagName,
                        id: el.id,
                        class: el.className,
                        text: el.textContent.trim()
                    });
                }
            }
            return results;
        });

        console.log("Elements containing 'As on' or time pattern:", elements);

        // Check specifically for .asondate
        const asondate = await page.evaluate(() => {
            const el = document.querySelector('.asondate');
            return el ? el.textContent.trim() : null;
        });

        console.log("Content of .asondate:", asondate);

        // Also check for any element with id containing 'asOn'
        const asOnElements = await page.evaluate(() => {
            const all = document.querySelectorAll('[id*="asOn"]');
            return Array.from(all).map(el => ({
                id: el.id,
                text: el.textContent.trim()
            }));
        });

        console.log("Elements with id containing 'asOn':", asOnElements);

    } catch (err) {
        console.error("❌ Error:", err.message);
        await page.screenshot({ path: 'debug_error.png' });
    }

    // Don't close browser so user can inspect
    // await browser.close();
}

debugNSE();