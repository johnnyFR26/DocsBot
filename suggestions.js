const predefinedMessages = [
    "Olá! Tudo bem? 😊",
    "Podemos te ajudar com algo?",
    "Seu pedido já está a caminho!",
    "Você gostaria de saber mais sobre nossos planos?",
    "Obrigado por entrar em contato conosco!"
];

export function initSuggestions() {
    const input = document.getElementById('message-input');
    const box = document.getElementById('suggestions-box');

    input.addEventListener('keydown', (e) => {
        if (e.key === '/') showSuggestions();
        if (e.key === 'Escape') hideSuggestions();
    });

    function showSuggestions() {
        box.classList.remove('hidden');
        box.innerHTML = `
            <ul>${predefinedMessages.map(msg => `<li>${msg}</li>`).join('')}</ul>
        `;

        const rect = input.getBoundingClientRect();
        box.style.top = `${rect.bottom + window.scrollY}px`;
        box.style.left = `${rect.left + window.scrollX}px`;

        box.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                input.value = li.innerText;
                hideSuggestions();
                input.focus();
            });
        });
    }

    function hideSuggestions() {
        box.classList.add('hidden');
    }
}
