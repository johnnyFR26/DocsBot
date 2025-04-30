const { Client } = require('whatsapp-web.js');
const http = require('./http');
const wss = require('./websocket');
const { saveMessage } = require('./db');
const File = require('../read_file');
const fs = require('fs');
const path = require('path');

const whatsappClient = new Client();
whatsappClient.initialize();

http.listen(5000, () => {
    console.log('Server running on port 5000');
});

whatsappClient.on('qr', (qr) => {
    wss.broadcast({ type: 'qr', qr });
});

whatsappClient.on('ready', () => {
    console.log('Client is ready!');
    wss.broadcast({ type: 'status', message: 'Client is ready!' });
});

whatsappClient.on('message', async message => {
    if (!message.from.endsWith('@c.us')) return;

    const timestamp = new Date().toISOString();

    if (!message.hasMedia) {
        saveMessage(message.from, message.body, timestamp);
        return wss.broadcast({
            type: 'text',
            from: message.from,
            body: message.body,
            timestamp
        });
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

        wss.broadcast({
            type: 'audio',
            from: message.from,
            timestamp,
            url
        });
    }
});

wss.onMessage(async (messageData, ws) => {
    if (messageData.type === 'send_message') {
        const { message, phoneNumber } = messageData;
        const chatId = `${phoneNumber}@c.us`;

        try {
            const response = await whatsappClient.sendMessage(chatId, message);
            console.log('Mensagem enviada com sucesso:', response);
            ws.send(JSON.stringify({ type: 'status', message: 'Mensagem enviada com sucesso!' }));
        } catch (err) {
            console.error('Erro ao enviar a mensagem:', err);
            ws.send(JSON.stringify({ type: 'status', message: 'Erro ao enviar a mensagem.' }));
        }
    }
});

// Carrega dados CSV
(async () => {
    const filePath = './csv/marco_2025.csv';
    const users = await File.csvToJSON(filePath);

    users.forEach(user => {
        const name = user.Nome?.trim();
        user.Nome = (name === '' || /^[\?]+$/.test(name)) ? "" : name;

        const finalizado = user.Finalizado.trim();
        user.Finalizado = (finalizado === '' || /^[\?]+$/.test(finalizado)) ? false : finalizado;
    });

    const notFinalized = users.filter(user => user.Finalizado === false).map(user => ({
        Nome: user.Nome,
        Whatsapp: user.Whatsapp.replace(/\D/g, '')
    }));

    http.app.get('/', (_, res) => {
        res.send(notFinalized);
    });
})();
