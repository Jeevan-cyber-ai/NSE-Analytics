const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function check() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    page.on('response', async (res) => {
        const url = res.url();
        if (url.includes('nseindia.com/api/') && url.includes('option') && res.status() === 200) {
            console.log("URL:", url);
            try {
                const data = await res.json();
                console.log("Data total rows:", data.records?.data?.length);
                const expiries = new Set(data.records?.data?.map(d => d.expiryDates || d.expiryDate));
                console.log("Expiries found in records.data:", [...expiries]);
            } catch(e) {}
        }
    });

    await page.goto('https://www.nseindia.com/option-chain', { waitUntil: 'networkidle0', timeout: 90000 });
    await browser.close();
}
check();
