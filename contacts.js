import { formatTime } from './utils.js';
import { renderMessages, setFilter } from './messages.js';

const sidebarList = document.querySelector('#sidebar ul');
const contactMessages = {};

export function updateSidebar(from, timestamp) {
    if (!contactMessages[from]) {
        contactMessages[from] = { count: 1, lastTime: timestamp };

        const li = document.createElement('li');
        li.setAttribute('data-from', from);
        li.innerText = `${from} (1 msg - ${formatTime(timestamp)})`;
        li.addEventListener('click', () => {
            setFilter(from);
            renderMessages(from);
            document.getElementById('phone-number-input').style.display = 'none';
        });

        sidebarList.appendChild(li);
    } else {
        contactMessages[from].count++;
        contactMessages[from].lastTime = timestamp;

        const li = sidebarList.querySelector(`li[data-from="${from}"]`);
        if (li) {
            li.innerText = `${from} (${contactMessages[from].count} - ${formatTime(timestamp)})`;
        }
    }
}
