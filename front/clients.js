import { socket } from './socket.js';

export let clientstosend = [];

export function fetchClients() {
    fetch('http://192.168.0.26:5000/')
        .then(res => res.json())
        .then(data => {
            clientstosend = data;
        });
}

export function callClients() {
    clientstosend.slice(20, 30).forEach((client, i) => {
        setTimeout(() => {
            sendMessagetoclient(client);
        }, i * 180000);
    });
}

function sendMessagetoclient(client) {
    socket.send(JSON.stringify({
        type: 'send_message',
        phoneNumber: `55${client.Whatsapp}`,
        message: `Boa tarde, ${client.Nome}! 😊 Tudo bem? 

Me chamo Thiago e sou responsável pelo seu painel da WhatsMenu! 🚀

Notei que faltam apenas alguns passos para você aumentar suas vendas e agilizar o seu atendimento ⚡📈.

Vamos dar continuidade agora e colocar tudo pra funcionar, ${client.Nome}? 💬💪`
    }));
}
