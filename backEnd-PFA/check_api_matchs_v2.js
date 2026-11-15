const http = require('http');

http.get('http://localhost:5000/api/matchs?lang=fr', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('First match:', JSON.stringify(json[0], null, 2));
        } catch (e) {
            console.log('Data is not JSON:', data.substring(0, 500));
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
