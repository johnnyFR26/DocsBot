const { Client } = require('whatsapp-web.js');
const express = require('express');
const { saveMessage, getAllMessages } = require('./db');
const http = require('http');
const WebSocket = require('ws');
const File = require("../read_file")
const cors = require('cors');


const app = express();
app.use(cors({
    origin: '*'
}));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const whatsappClient = new Client();

whatsappClient.on('qr', (qr) => {
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'qr', qr }));
        }
    });
});

whatsappClient.on('ready', () => {
    console.log('Client is ready!');
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'status', message: 'Client is ready!' }));
        }
    });
});

whatsappClient.on('message', message => {
    console.log(`Mensagem recebida: ${message.body}`);

    const timestamp = new Date().toISOString();

    if(message.from === 'status@broadcast'){
        return
    }

    saveMessage(message.from, message.body, timestamp);

    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'message',
                from: message.from,
                body: message.body,
                timestamp
            }));
        }
    });
});

app.get('/messages', (req, res) => {
    const messages = getAllMessages();

    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        from: msg.from_number,
        body: msg.body,
        timestamp: msg.timestamp
    }));

    res.json(formattedMessages);
});

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const messageData = JSON.parse(data);
        if (messageData.type === 'send_message') {
            const { message, phoneNumber } = messageData;
            const chatId = `${phoneNumber}@c.us`;  // Número de WhatsApp formatado

            whatsappClient.sendMessage(chatId, message).then(response => {
                console.log('Mensagem enviada com sucesso:', response);
                ws.send(JSON.stringify({ type: 'status', message: 'Mensagem enviada com sucesso!' }));
            }).catch(err => {
                console.error('Erro ao enviar a mensagem:', err);
                ws.send(JSON.stringify({ type: 'status', message: 'Erro ao enviar a mensagem.' }));
            });
        }
    });
});

whatsappClient.initialize();

server.listen(5000, () => {
    console.log('Server running on port 5000');
});

(async () => {
    const filePath = './csv/abril_2025.csv'
    const users = await File.csvToJSON(filePath)
    users.forEach(user => {
        const finalizado = user.Finalizado.trim()
    
        user.Finalizado = (
          finalizado.includes('CANCELADO') ||
          finalizado === '' || 
          /^[\?]+$/.test(finalizado)
        ) ? false : finalizado
      })
    
      const usersThatHaveNotBeenFinalized = users.filter(user => {
        const finalizado = user.Finalizado
        return finalizado === false
      })
      .map(user => ({
        Nome: user.Nome,
        Whatsapp: user.Whatsapp.replace(/\D/g, '')
      }))

    app.get('/', (req, res) => {
        res.send(JSON.stringify(usersThatHaveNotBeenFinalized))
    })
})()
