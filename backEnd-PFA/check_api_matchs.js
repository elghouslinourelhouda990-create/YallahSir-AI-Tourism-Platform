const fetch = require('node-fetch');

async function checkApi() {
    try {
        const res = await fetch('http://localhost:5000/api/matchs?lang=fr');
        const data = await res.json();
        console.log('First match:', JSON.stringify(data[0], null, 2));
    } catch (err) {
        console.error(err);
    }
}

checkApi();
