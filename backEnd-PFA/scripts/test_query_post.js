const axios = require('axios');
axios.post('http://localhost:5000/api/recommendations/get-recommendation', {
    choices: { activities: ["cuisine"], teams: [], eventTypes: [], watchWhere: "" },
    userId: "test2_api"
}).then(r => console.log(JSON.stringify(r.data, null, 2)))
.catch(e => console.error(e.response ? e.response.data : e.message));
