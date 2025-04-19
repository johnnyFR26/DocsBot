import { formatTime } from './utils.js';
import { renderMessages, setFilter } from './messages.js';

const sidebarList = document.querySelector('#sidebar .sidebar-list');
const contactMessages = {};

export function updateSidebar(from, timestamp) {
    if (!contactMessages[from]) {
        contactMessages[from] = { count: 1, lastTime: timestamp };

        const contactDiv = document.createElement('div');
        contactDiv.classList.add('contact-item');
        contactDiv.setAttribute('data-from', from);
        contactDiv.innerText = `${from} (1 msg - ${formatTime(timestamp)})`;

        contactDiv.addEventListener('click', () => {
            setFilter(from);
            renderMessages(from);
            document.getElementById('phone-number-input').style.display = 'none';

            // marca como ativo
            sidebarList.querySelectorAll('.contact-item').forEach(item => item.classList.remove('active'));
            contactDiv.classList.add('active');
        });

        sidebarList.appendChild(contactDiv);
    } else {
        contactMessages[from].count++;
        contactMessages[from].lastTime = timestamp;

        const contactDiv = sidebarList.querySelector(`.contact-item[data-from="${from}"]`);
        if (contactDiv) {
            contactDiv.innerText = `${from} (${contactMessages[from].count} - ${formatTime(timestamp)})`;
        }
    }
}
