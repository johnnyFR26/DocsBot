import { handleMessage } from './messages.js';
import { showQRCode, showStatus } from './dom.js';

export let socket = null;

export function initSocket() {
    socket = new WebSocket('ws://192.168.0.211:5000');

    socket.onopen = () => console.log('Conectado ao WebSocket');
    socket.onclose = () => console.log('Desconectado do WebSocket');

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case 'qr':
                showQRCode(data.qr);
                break;
            case 'status':
                showStatus(data.message);
                break;
            case 'message':
                handleMessage(data);
                break;
        }
    };
}
