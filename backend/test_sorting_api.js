const axios = require('axios');

async function testSorting() {
    try {
        const date = '2026-04-01';
        const expiry = '07-Apr-2026';
        const res = await axios.get(`http://localhost:5000/api/timestamps?date=${date}&expiry=${expiry}`);
        console.log('Returned Timestamps (Top 5):');
        res.data.slice(0, 5).forEach(t => console.log(`  - ${t.timestamp}`));
        
        console.log('Returned Timestamps (Bottom 5):');
        res.data.slice(-5).forEach(t => console.log(`  - ${t.timestamp}`));
        
        process.exit(0);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}

testSorting();
