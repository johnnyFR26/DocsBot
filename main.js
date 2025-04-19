import { initSocket } from './socket.js';
import { setupDOMListeners } from './dom.js';
import { fetchClients } from './clients.js';

window.addEventListener('DOMContentLoaded', () => {
    fetchClients();         // busca os clientes da API
    initSocket();           // inicia o WebSocket
    setupDOMListeners();    // eventos de clique e input
});
