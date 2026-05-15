const fetch = require('node-fetch'); // or native fetch if Node 18+

async function test() {
    const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    const targetUrl = 'https://export.arxiv.org/api/query?search_query=cat:quant-ph&sortBy=submittedDate&sortOrder=descending&max_results=2';
    const query = encodeURIComponent(targetUrl);

    for (const proxy of proxies) {
        console.log(`Testing proxy: ${proxy}`);
        try {
            const url = proxy + query;
            const res = await global.fetch(url);
            if (!res.ok) {
                console.log(`  Failed with status: ${res.status}`);
                continue;
            }
            const text = await res.text();
            console.log(`  Success! Length: ${text.length}`);
            console.log(`  Snippet: ${text.substring(0, 100).replace(/\n/g, ' ')}`);
        } catch (e) {
            console.log(`  Error: ${e.message}`);
        }
    }
}

test();
