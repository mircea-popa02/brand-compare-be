const express = require('express');

const app = express();

app.use(express.json());

app.post('/profile-data', (req, res) => {
    // Handle the /profile-data POST request here
    // You can access the request body using req.body
    // Perform any necessary operations and send a response using res.send()
    console.log(req.body);
});

app.post('/brands', (req, res) => {
    // Handle the /brands POST request here
    // You can access the request body using req.body
    // Perform any necessary operations and send a response using res.send()
    console.log(req.body);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});