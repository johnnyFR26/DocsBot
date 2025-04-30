const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { getAllMessages } = require('./db');

const app = express();

app.use(cors({ origin: '*' }));
app.use('/audios', express.static(path.join(__dirname, '../../audios')));

app.get('/messages', async (req, res) => {
    const messages = getAllMessages();
    res.json(messages);
});

const server = http.createServer(app);

module.exports = server;
module.exports.app = app;
