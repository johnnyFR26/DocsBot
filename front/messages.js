import { updateSidebar } from './contacts.js';

export const allMessages = [];
let filter = null;
let selected = null;
const BACKEND_URL = 'http://192.168.0.243:5000';


fetch('http://192.168.0.26:5000/messages')
    .then(res => res.json())
    .then(messages => {
        messages.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
            // Verifica se a mensagem é de áudio
            if (msg.type === 'audio') {
                allMessages.push({
                    from: msg.from,
                    type: 'audio',
                    timestamp: msg.timestamp,
                    url: msg.url
                });
            } else {
                allMessages.push({
                    from: msg.from,
                    type: 'text',
                    timestamp: msg.timestamp,
                    body: msg.body
                });
            }

            updateSidebar(msg.from, msg.timestamp);
        });
        renderMessages();
    });

export function selectedPhoneNumber() {
    return selected;
}

export function clearSelectedPhoneNumber() {
    selected = null;
}

export function setFilter(from) {
    filter = from;
    selected = from ? from.replace('@c.us', '') : null;
}

export function currentFilter() {
    return filter;
}

export function renderMessages(from = null) {
    const container = document.getElementById('messages');
    container.innerHTML = '';

    const filtered = from ? allMessages.filter(m => m.from === from) : allMessages;

    filtered.forEach(data => {
        const div = document.createElement('div');
        div.classList.add('message');

        if (data.type === 'audio') {
            div.innerHTML = `
                <div class="from">De: ${data.from}</div>
                <audio controls>
                    <source src="${BACKEND_URL}${data.url}" type="audio/ogg">
                    Seu navegador não suporta o elemento de áudio.
                </audio>
            `;
        } else {
            div.innerHTML = `
                <div class="from">De: ${data.from}</div>
                <div class="body">Mensagem: ${data.body}</div>
            `;
        }

        container.appendChild(div);
    });
}

export function handleMessage(data) {
    console.log(data);
    const timestamp = new Date();
    data.timestamp = timestamp;

    if (data.type === 'audio') {
        console.log(data.url);
        allMessages.push({
            from: data.from,
            type: 'audio',
            timestamp,
            url: data.url
        });
    } else {
        allMessages.push({
            from: data.from,
            type: 'text',
            timestamp,
            body: data.body
        });
    }

    if (!filter || filter === data.from) {
        renderMessages(filter);
    }

    updateSidebar(data.from, timestamp);
}
