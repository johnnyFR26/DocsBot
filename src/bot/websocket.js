const WebSocket = require('ws');
const server = require('./http');

const wss = new WebSocket.Server({ server });

wss.broadcast = function (data) {
    const json = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(json);
        }
    });
};

wss.onMessage = function (handler) {
    wss.on('connection', (ws) => {
        ws.on('message', (data) => {
            try {
                const messageData = JSON.parse(data);
                handler(messageData, ws);
            } catch (e) {
                console.error('Mensagem WebSocket malformada:', e);
            }
        });
    });
};

module.exports = wss;
