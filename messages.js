import { formatTime } from './utils.js';
import { updateSidebar } from './contacts.js';

export const allMessages = [];
let filter = null;
let selected = null;

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
        div.innerHTML = `
            <div class="from">De: ${data.from}</div>
            <div class="body">Mensagem: ${data.body}</div>
        `;
        container.appendChild(div);
    });
}

export function handleMessage(data) {
    const timestamp = new Date();
    data.timestamp = timestamp;
    allMessages.push(data);

    if (!filter || filter === data.from) {
        renderMessages(filter);
    }

    updateSidebar(data.from, timestamp);
}
