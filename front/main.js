import { initSocket } from './socket.js';
import { setupDOMListeners } from './dom.js';
import { fetchClients } from './clients.js';
import { setupAudioRecorder } from './audioRecorder.js';

window.addEventListener('DOMContentLoaded', () => {
    fetchClients();
    initSocket();
    setupDOMListeners();
    setupAudioRecorder();
});
