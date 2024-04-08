require('dotenv').config();

const express = require('express');

const app = express();

app.use(express.json());

const api_url = 'https://app.socialinsider.io/api';

app.post('/profile-data', (req, res) => {
    const { profile_type, id, start, end } = req.body;

    if (end < start) {
        res.status(400).send('End date must be after start date');
        return;
    }

    async function fetchProfileData() {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + process.env.API_KEY,
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'socialinsider_api.get_profile_data',
                params: {
                    id,
                    profile_type,
                    date: {
                        start,
                        end,
                        timezone: 'Europe/London',
                    },
                },
            }),
        });

        const data = await response.json();
        return data;
    }

    fetchProfileData().then((data) => {
        res.send(data);
    });
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
