const fs = require('fs');

const htmlPath = 'chat.html';
let content = fs.readFileSync(htmlPath, 'utf8');

const regex = /<script>\s*const chatContainer[\s\S]*?<\/html>/m;

const replacementText = `<script>
        const chatContainer = document.getElementById('chatHistory');
        const userId = "user_" + Math.random().toString(36).substring(7);

        function fillInput(text) {
            const inputField = document.getElementById('chat-input');
            inputField.value = text;
            inputField.focus();
        }

        async function sendMessage(event) {
            event.preventDefault();
            const inputField = document.getElementById('chat-input');
            const message = inputField.value.trim();

            if (message !== "") {
                // Masquer les suggestions
                const suggestionsHeader = document.querySelector('.suggestions-header');
                const suggestionsGrid = document.querySelector('.suggestions-grid');
                if (suggestionsHeader) suggestionsHeader.style.display = 'none';
                if (suggestionsGrid) suggestionsGrid.style.display = 'none';
                
                // Mettre à jour la hauteur pour qu'elle prenne toute la place disponible
                const chatHistoryContainer = document.getElementById('chatHistory');
                if (chatHistoryContainer) chatHistoryContainer.style.maxHeight = '75vh';

                appendUserMessage(message);
                inputField.value = "";
                
                const lang = localStorage.getItem('selectedLang') || 'fr';
                const T = window.ui_translations ? (window.ui_translations[lang] || window.ui_translations['fr']) : {};
                const loadingBubble = appendBotMessage(T.chat_loading || "...", true);

                try {
                    const response = await fetch("http://localhost:5000/api/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_USER: userId, message: message })
                    });
                    const data = await response.json();
                    
                    loadingBubble.style.fontStyle = 'normal';
                    loadingBubble.style.color = 'var(--text-dark)';
                    
                    if (data.reponse_bot && data.reponse_bot.contenu_message) {
                        loadingBubble.innerText = data.reponse_bot.contenu_message;
                    } else if (data.error) {
                        loadingBubble.innerText = "Erreur: " + data.error;
                    } else {
                        loadingBubble.innerText = T.chat_error || "Désolé, une erreur s'est produite lors de la génération de la réponse.";
                    }
                } catch (err) {
                    console.error("Erreur backend:", err);
                    loadingBubble.style.fontStyle = 'normal';
                    loadingBubble.innerText = T.chat_server_error || "Impossible de joindre le serveur. Assurez-vous qu'il tourne sur le port 5000.";
                }
            }
        }

        function appendUserMessage(text) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.justifyContent = 'flex-end';
            wrapper.style.width = '100%';

            const msgDiv = document.createElement('div');
            msgDiv.style.backgroundColor = 'var(--primary-red, #d32f2f)';
            msgDiv.style.color = '#fff';
            msgDiv.style.padding = '24px 32px';
            msgDiv.style.borderRadius = '30px 30px 5px 30px'; 
            msgDiv.style.maxWidth = '80%';
            msgDiv.style.boxShadow = 'var(--shadow-soft, 0 8px 30px rgba(0, 0, 0, 0.04))';
            msgDiv.style.fontSize = '1.1rem';
            msgDiv.style.lineHeight = '1.6';
            msgDiv.style.marginTop = '10px';
            msgDiv.innerText = text;

            wrapper.appendChild(msgDiv);
            chatContainer.appendChild(wrapper);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function appendBotMessage(text, isLoading=false) {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'flex-start';
            wrapper.style.gap = '24px';
            wrapper.style.width = '100%';

            const botAvatar = document.createElement('div');
            botAvatar.className = 'bot-avatar-large';
            botAvatar.innerHTML = '<img src="chatbot.png" alt="Chatbot" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">';

            const chatBubble = document.createElement('div');
            chatBubble.className = 'chat-bubble';
            if (isLoading) {
                 chatBubble.style.fontStyle = 'italic';
                 chatBubble.style.color = '#888';
                 chatBubble.style.minHeight = '70px';
            }
            chatBubble.innerText = text;

            wrapper.appendChild(botAvatar);
            wrapper.appendChild(chatBubble);
            chatContainer.appendChild(wrapper);
            chatContainer.scrollTop = chatContainer.scrollHeight;

            return chatBubble;
        }
    </script>
</body>

</html>`;

content = content.replace(regex, replacementText);
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('Restored JS correctly');
