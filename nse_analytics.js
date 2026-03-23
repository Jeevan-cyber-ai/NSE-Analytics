const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function monitorNSE(){
    console.log("Launching Visible Stealth Browser...");
    
    const browser = await puppeteer.launch({ 
        headless: false, // Set to false so you can see it working
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 
        args: ['--start-maximized']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    let lastTS = null;
    let lastChangeTime = Date.now();

  const checkData = async () => {
        try {
            console.log("\n--- Checking NSE (Human-Mimic Mode) ---");
            
            
            await page.goto('https://www.nseindia.com/market-data/live-equity-market', { 
                waitUntil: 'networkidle2', 
                timeout: 60000 
            });
            await new Promise(r => setTimeout(r, 3000));

           
            await page.goto('https://www.nseindia.com/option-chain', { 
                waitUntil: 'networkidle2', 
                timeout: 60000 
            });

           
            console.log("Waiting for data table to render...");
            await page.waitForSelector('.asondate', { visible: true, timeout: 30000 });

            const currentTS = await page.evaluate(() => {
                const element = document.querySelector('.asondate');
                return element ? element.innerText.replace('As on ', '').trim() : null;
            });

            console.log(`Current timestamp: ${currentTS}`);

            if (currentTS && currentTS !== lastTS) {
                const now = Date.now();
                if (lastTS) {
                    const diff = Math.round((now - lastChangeTime) / 1000);
                    console.log(`✅ [SUCCESS] New Time: ${currentTS} | Frequency: ${diff}s`);
                } else {
                    console.log(`📊 [START] Baseline Captured: ${currentTS}`);
                }
                lastTS = currentTS;
                lastChangeTime = now;
            } else {
                console.log("...Data fetched, timestamp hasn't changed yet.");
            }
        } catch (err) {
            console.error("❌ Error:", err.message);
            
            await page.screenshot({ path: 'debug_error.png' });
            console.log("Saved 'debug_error.png' - open this to see what went wrong.");
        }
    };
    setInterval(checkData, 60000); 
    await checkData();
}

monitorNSE();