import { currentFilter, renderMessages, setFilter } from './messages.js';
import { selectedPhoneNumber, clearSelectedPhoneNumber } from './messages.js';

export function setupDOMListeners() {
    const sendButton = document.getElementById('send-button');
    const phoneInput = document.getElementById('phone-number-input');
    const messageInput = document.getElementById('message-input');
    const clearButton = document.getElementById('clear-filter-button');

    sendButton.addEventListener('click', () => {
        const phone = selectedPhoneNumber() || phoneInput.value;
        const msg = messageInput.value;

        if (!phone || !msg) {
            alert('Preencha número e mensagem');
            return;
        }

        import('./socket.js').then(({ socket }) => {
            socket.send(JSON.stringify({ type: 'send_message', phoneNumber: phone, message: msg }));
        });

        phoneInput.value = '';
        messageInput.value = '';
    });

    clearButton.addEventListener('click', () => {
        setFilter(null);
        clearSelectedPhoneNumber();
        renderMessages();
        phoneInput.style.display = '';
    });

    // sugestões
    import('./suggestions.js').then(({ initSuggestions }) => {
        initSuggestions();
    });
}

export function showQRCode(qr) {
    document.getElementById('root').innerHTML =
        `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qr)}" />`;
}

export function showStatus(message) {
    alert(message);
}
