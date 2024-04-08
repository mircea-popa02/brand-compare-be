require('dotenv').config();

const express = require('express');

const app = express();

app.use(express.json());

const api_url = 'https://app.socialinsider.io/api';

app.post('/profile-data', (req, res) => {
});

app.get('/brands', (req, res) => {
    async function fetchBrands() {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.API_KEY,
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 0,
                method: 'socialinsider_api.get_brands',
                params: {
                    projectname: 'API_test',
                },
            }),
        });

        const data = await response.json();
        return data;
    }

    fetchBrands().then((data) => {
        res.send(data);
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
