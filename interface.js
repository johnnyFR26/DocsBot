const divQr = document.getElementById('root');
const messagesDiv = document.getElementById('messages');
const phoneNumberInput = document.getElementById('phone-number-input');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const callButton = document.getElementById('call-button');
const sidebarList = document.querySelector('#sidebar ul');
let selectedPhoneNumber = null;

const contactMessages = {}; // Armazena o número de mensagens por contato
let clientstosend = [];
const allMessages = []; // Armazena todas as mensagens
let currentFilter = null;

callButton.addEventListener('click', callClients);

fetch('http://192.168.0.211:5000')
    .then(response => response.json())
    .then(data => {
        clientstosend = data;
        console.table(clientstosend);
    });

// Conectar ao WebSocket do servidor
const socket = new WebSocket('ws://192.168.0.211:5000');

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'qr') {
        divQr.innerHTML = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' +
            encodeURIComponent(data.qr) + '" />';
        return;
    }

    if (data.type === 'status') {
        alert(data.message);
        return;
    }

    if (data.type === 'message') {
        const timestamp = new Date();
        data.timestamp = timestamp;
        allMessages.push(data);

        // Se o filtro estiver ativo, só renderiza se for do contato atual
        if (!currentFilter || currentFilter === data.from) {
            renderMessages(currentFilter);
        }

        if (!contactMessages[data.from]) {
            contactMessages[data.from] = {
                count: 1,
                lastTime: timestamp
            };

            const contactItem = document.createElement('li');
            contactItem.setAttribute('data-from', data.from);
            contactItem.innerText = `${data.from} (1 msg - ${formatTime(timestamp)})`;
            contactItem.addEventListener('click', () => {
                currentFilter = data.from;
                selectedPhoneNumber = data.from.replace('@c.us', '');
                renderMessages(data.from);
            
                // Esconde o campo de número
                phoneNumberInput.style.display = 'none';
            });

            sidebarList.appendChild(contactItem);
        } else {
            contactMessages[data.from].count++;
            contactMessages[data.from].lastTime = timestamp;

            const contactItem = sidebarList.querySelector(`li[data-from="${data.from}"]`);
            if (contactItem) {
                contactItem.innerText = `${data.from} (${contactMessages[data.from].count} - ${formatTime(timestamp)})`;
            }
        }
    }
};

socket.onopen = () => {
    console.log('Conectado ao WebSocket');
};

socket.onclose = () => {
    console.log('Desconectado do WebSocket');
};

function sendMessagetoclient(client) {
    socket.send(JSON.stringify({
        type: 'send_message',
        phoneNumber: `55${client.Whatsapp}`,
        message: `Boa noite, ${client.Nome}! 😊 Tudo bem? 

Me chamo Thiago e sou responsável pelo seu painel da WhatsMenu! 🚀

Notei que faltam apenas alguns passos para você aumentar suas vendas e agilizar o seu atendimento ⚡📈.

Vamos dar continuidade agora e colocar tudo pra funcionar, ${client.Nome}? 💬💪`
    }));
}

function callClients() {
    clientstosend.slice(0, 10).forEach((client, index) => {
        setTimeout(() => {
            sendMessagetoclient(client);
        }, index * 180000); // 3 minutos por cliente
    });
}

// Enviar mensagem ao backend com o número de telefone
sendButton.addEventListener('click', () => {
    const phoneNumber = selectedPhoneNumber || phoneNumberInput.value;
    const message = messageInput.value;

    if (phoneNumber && message) {
        socket.send(JSON.stringify({
            type: 'send_message',
            phoneNumber: phoneNumber,
            message: message
        }));

        phoneNumberInput.value = '';
        messageInput.value = '';
    } else {
        alert('Por favor, insira o número de telefone e a mensagem.');
    }
});

function renderMessages(from = null) {
    messagesDiv.innerHTML = '';

    const filtered = from
        ? allMessages.filter(m => m.from === from)
        : allMessages;

    filtered.forEach(data => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `
            <div class="from">De: ${data.from}</div>
            <div class="body">Mensagem: ${data.body}</div>
        `;
        messagesDiv.appendChild(messageElement);
    });
}

function formatTime(date) {
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

const clearFilterButton = document.getElementById('clear-filter-button');

clearFilterButton.addEventListener('click', () => {
    currentFilter = null;
    selectedPhoneNumber = null;
    renderMessages();

    // Mostra o campo de número novamente
    phoneNumberInput.style.display = '';
});


