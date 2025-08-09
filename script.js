class NativeAI {
    constructor() {
        this.currentPage = 'landing';
        this.chatHistory = [];
        this.isTyping = false;
        this.apiUrl = 'http://localhost:8000'; // URL de ton backend FastAPI

        this.init();
    }

    init() {
        this.createParticles();
        this.setupEventListeners();
        this.startTypingAnimation();
        this.startCodeAnimation();
        this.autoResizeTextarea();
    }

    // Création des particules
    createParticles() {
        const container = document.getElementById('particles-container');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const size = Math.random() * 4 + 1;
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const duration = Math.random() * 3 + 3;
            const delay = Math.random() * 2;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;

            container.appendChild(particle);
        }
    }

    // Événements
    setupEventListeners() {
        document.getElementById('chat-btn').addEventListener('click', () => this.showChat());
        document.getElementById('main-chat-btn').addEventListener('click', () => this.showChat());
        document.getElementById('back-btn').addEventListener('click', () => this.showLanding());
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());

        document.getElementById('chat-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        document.getElementById('clear-chat').addEventListener('click', () => this.clearChat());

        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => this.selectSuggestion(chip.textContent));
        });

        document.getElementById('chat-input').addEventListener('input', () => this.validateInput());
    }

    // Navigation
    showChat() {
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('chat-page').classList.add('active');
        this.currentPage = 'chat';

        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 100);
    }

    showLanding() {
        document.getElementById('chat-page').classList.remove('active');
        document.getElementById('landing-page').classList.add('active');
        this.currentPage = 'landing';
    }

    // Animation titre
    startTypingAnimation() {
        const text = "Assistant IA pour développeurs LUA";
        const typingElement = document.querySelector('.typing-text');
        let index = 0;

        const typeWriter = () => {
            if (index < text.length) {
                typingElement.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, 100);
            }
        };

        setTimeout(typeWriter, 1000);
    }

    // Animation code
    startCodeAnimation() {
        const codeLines = [
            "-- Native AI Assistant pour RedM/FiveM",
            "RegisterCommand('spawn_vehicle', function(source)",
            "    local player = ESX.GetPlayerFromId(source)",
            "    local coords = GetEntityCoords(GetPlayerPed(source))",
            "    ",
            "    local vehicle = CreateVehicle(",
            "        GetHashKey('adder'),",
            "        coords.x, coords.y, coords.z,",
            "        GetEntityHeading(GetPlayerPed(source)),",
            "        true, false",
            "    )",
            "    ",
            "    TaskWarpPedIntoVehicle(",
            "        GetPlayerPed(source), vehicle, -1",
            "    )",
            "end, false)"
        ];

        const codeElement = document.getElementById('code-animation');
        let lineIndex = 0;
        let charIndex = 0;

        const animateCode = () => {
            if (lineIndex < codeLines.length) {
                const currentLine = codeLines[lineIndex];

                if (charIndex < currentLine.length) {
                    const currentText = codeElement.textContent;
                    const lines = currentText.split('\n');
                    lines[lineIndex] = currentLine.substring(0, charIndex + 1);
                    codeElement.textContent = lines.join('\n');
                    charIndex++;
                    setTimeout(animateCode, 50);
                } else {
                    lineIndex++;
                    charIndex = 0;
                    codeElement.textContent += '\n';
                    setTimeout(animateCode, 200);
                }
            }
        };

        setTimeout(animateCode, 2000);
    }

    // Redimension automatique de la zone de texte
    autoResizeTextarea() {
        const textarea = document.getElementById('chat-input');
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    validateInput() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        sendBtn.disabled = input.value.trim().length === 0;
    }

    selectSuggestion(suggestion) {
        const input = document.getElementById('chat-input');
        input.value = suggestion;
        input.focus();
        this.validateInput();
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        this.addMessage(message, 'user');
        input.value = '';
        this.validateInput();

        this.showTypingIndicator();

        try {
            const response = await this.sendToAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("⚠️ Erreur de connexion au serveur FastAPI.", 'ai');
            console.error('API Error:', error);
        }

        this.scrollToBottom();
    }

    async sendToAPI(message) {
        const response = await fetch(`${this.apiUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response || "Réponse reçue du serveur.";
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        const isUser = sender === 'user';

        messageDiv.className = isUser ? 'user-message fade-in' : 'ai-message fade-in';

        const time = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (isUser) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-header">
                        <span class="sender-name">Vous</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${this.formatMessage(content)}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="ai-avatar">
                    <div class="avatar-glow"></div>
                    <span>N</span>
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="sender-name">Native AI</span>
                        <span class="message-time">${time}</span>
                    </div>
                    <div class="message-text">${this.formatMessage(content)}</div>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        this.chatHistory.push({ content, sender, time });
    }

    formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        if (document.querySelector('.typing-indicator')) return;

        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator fade-in';

        typingDiv.innerHTML = `
            <div class="ai-avatar">
                <div class="avatar-glow"></div>
                <span>N</span>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.closest('.ai-message').remove();
        }
        this.isTyping = false;
    }

    clearChat() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = '';
        this.chatHistory = [];
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

window.nativeAI = null;
document.addEventListener('DOMContentLoaded', () => {
    window.nativeAI = new NativeAI();
});
