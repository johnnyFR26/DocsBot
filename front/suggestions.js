const predefinedMessages = [
    "Olá! Tudo bem? 😊",
    "Podemos te ajudar com algo?",
    "Nos chame no numero oficial https://api.whatsapp.com/send/?phone=5511937036875&text=Preciso%20de%20ajuda",
    "Você já está proximo ao computador?",
    "Obrigado por entrar em contato conosco!"
];

export function initSuggestions() {
    const input = document.getElementById('message-input');
    const box = document.getElementById('suggestions-box');
    let currentIndex = -1;

    input.addEventListener('keydown', (e) => {
        const items = box.querySelectorAll('li');

        if (e.key === '/') {
            showSuggestions();
            currentIndex = -1;
        }

        if (e.key === 'Escape') {
            hideSuggestions();
        }

        if ((e.key === 'ArrowDown' || e.key === 'Tab') && !box.classList.contains('hidden')) {
            e.preventDefault();
            if (items.length === 0) return;
            currentIndex = (currentIndex + 1) % items.length;
            updateFocus(items);
        }

        if (e.key === 'ArrowUp' && !box.classList.contains('hidden')) {
            e.preventDefault();
            if (items.length === 0) return;
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateFocus(items);
        }

        if (e.key === 'Enter' && currentIndex >= 0 && !box.classList.contains('hidden')) {
            e.preventDefault();
            input.value = items[currentIndex].innerText;
            hideSuggestions();
            input.focus();
        }
    });

    function showSuggestions() {
        box.classList.remove('hidden');
        currentIndex = -1;
        box.innerHTML = `
            <ul>
                ${predefinedMessages.map((msg, i) => `<li tabindex="-1">${msg}</li>`).join('')}
            </ul>
        `;

        const rect = input.getBoundingClientRect();
        box.style.top = `${rect.bottom + window.scrollY}px`;
        box.style.left = `${rect.left + window.scrollX}px`;

        box.querySelectorAll('li').forEach((li) => {
            li.addEventListener('click', () => {
                input.value = li.innerText;
                hideSuggestions();
                input.focus();
            });
        });
    }

    function updateFocus(items) {
        items.forEach((item, index) => {
            if (index === currentIndex) {
                item.classList.add('focused');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('focused');
            }
        });
    }

    function hideSuggestions() {
        box.classList.add('hidden');
        box.innerHTML = '';
        currentIndex = -1;
    }
}
