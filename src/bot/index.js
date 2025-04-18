const { Client } = require('whatsapp-web.js');
const express = require('express');
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

// Enviar o QR code via WebSocket
whatsappClient.on('qr', (qr) => {
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'qr', qr }));
        }
    });
});

// Notificar quando o cliente estiver pronto
whatsappClient.on('ready', () => {
    console.log('Client is ready!');
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'status', message: 'Client is ready!' }));
        }
    });
});

// Escutar e enviar as mensagens recebidas via WebSocket
whatsappClient.on('message', message => {
    console.log(`Mensagem recebida: ${message.body}`);
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'message',
                from: message.from,
                body: message.body
            }));
        }
    });
});

// Receber mensagens e números do frontend e enviá-las via WhatsApp
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

// Inicializar o cliente WhatsApp
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
