const { Client } = require('whatsapp-web.js');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const File = require("../read_file")
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getAllMessages, saveMessage } = require('./db');

const app = express();
app.use(cors({ origin: '*' }));
app.use('/audios', express.static(path.join(__dirname, '../../audios')));

app.get('/messages', async (req, res) => {
    const messages = await getAllMessages();
    res.json(messages);
})

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

whatsappClient.on('message', async message => {
    console.log(`Mensagem recebida de ${message.from}`);

    if(message.from == 'status@broadcast') {
        return;
    }

    const timestamp = new Date().toISOString();

    if (!message.hasMedia) {
        saveMessage(message.from, message.body, timestamp); wss.clients.forEach((ws) => { if (ws.readyState === WebSocket.OPEN) { ws.send(JSON.stringify({ type: 'message', from: message.from, body: message.body, timestamp,
                    type: 'text'
                }));
            }
        });
        return;
    }

    const media = await message.downloadMedia();
    if (!media) return;

    if (media.mimetype.startsWith('audio/')) {
        const buffer = Buffer.from(media.data, 'base64');
        const filename = `audio-${Date.now()}.ogg`;
        const filePath = path.join(__dirname, '../../audios', filename);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, buffer);

        const url = `/audios/${filename}`;
        saveMessage(message.from, null, timestamp, 'audio', url);

        wss.clients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                console.log(`Mensagem de áudio recebida de ${message.from}`);
                ws.send(JSON.stringify({
                    type: 'audio',
                    from: message.from,
                    timestamp,
                    url
                }));
            }
        });
    }
});

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const messageData = JSON.parse(data);
        if (messageData.type === 'send_message') {
            const { message, phoneNumber } = messageData;
            const chatId = `${phoneNumber}@c.us`;

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
    const filePath = './csv/marco_2025.csv';
    const users = await File.csvToJSON(filePath);

    users.forEach(user => {
        const name = user.Nome?.trim();
        user.Nome = (
            name === '' || 
            /^[\?]+$/.test(name)
        ) ? "" : name;

        const finalizado = user.Finalizado.trim();
        user.Finalizado = (
            finalizado === '' || 
            /^[\?]+$/.test(finalizado)
        ) ? false : finalizado;
    });

    const usersThatHaveNotBeenFinalized = users.filter(user => {
        return user.Finalizado === false;
    }).map(user => ({
        Nome: user.Nome,
        Whatsapp: user.Whatsapp.replace(/\D/g, '')
    }));

    app.get('/', (req, res) => {
        res.send(usersThatHaveNotBeenFinalized);
    });
})();
