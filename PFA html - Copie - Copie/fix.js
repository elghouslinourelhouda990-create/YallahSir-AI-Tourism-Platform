const fs = require('fs');

const htmlPath = 'chat.html';
let content = fs.readFileSync(htmlPath, 'utf8');

const regex = /<main>[\s\S]*?<script src="translations\.js"><\/script>/m;

const replacementText = `<main>

        <div class="chat-container" id="chatHistory" style="flex-direction: column; overflow-y: auto; max-height: 50vh; padding-right: 10px;">
            <div class="bot-message-wrapper" style="display: flex; align-items: flex-start; gap: 24px; min-height: 80px;">
                <div class="bot-avatar-large">
                    <img src="chatbot.png" alt="Chatbot" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                </div>
                <div class="chat-bubble" data-i18n="chat_welcome">
                    Salut ! Je suis votre assistant pour la Coupe du Monde 2030 au Maroc. Comment puis-je vous aider aujourd'hui ?
                </div>
            </div>
        </div>

        <div class="interaction-panel">

            <div class="suggestions-header">
                <i class="fa-solid fa-wand-magic-sparkles"></i> <span data-i18n="chat_suggestions">Suggestions</span>
            </div>

            <div class="suggestions-grid">
                <div class="suggestion-card" onclick="fillInput(this.querySelector('span').innerText)">
                    <div class="suggestion-content">
                        <div class="suggestion-icon icon-hotel">
                            🏨
                        </div>
                        <span data-i18n="chat_sugg_1">Quels sont les meilleurs hôtels à Casablanca ?</span>
                    </div>
                    <i class="fa-solid fa-chevron-right"></i>
                </div>

                <div class="suggestion-card" onclick="fillInput(this.querySelector('span').innerText)">
                    <div class="suggestion-content">
                        <div class="suggestion-icon icon-map">
                            📍
                        </div>
                        <span data-i18n="chat_sugg_2">Où se trouvent les stades ?</span>
                    </div>
                    <i class="fa-solid fa-chevron-right"></i>
                </div>

                <div class="suggestion-card" onclick="fillInput(this.querySelector('span').innerText)">
                    <div class="suggestion-content">
                        <div class="suggestion-icon icon-food">
                            🥘
                        </div>
                        <span data-i18n="chat_sugg_3">Recommandez-moi un restaurant marocain</span>
                    </div>
                    <i class="fa-solid fa-chevron-right"></i>
                </div>

                <div class="suggestion-card" onclick="fillInput(this.querySelector('span').innerText)">
                    <div class="suggestion-content">
                        <div class="suggestion-icon icon-bus">
                            🚌
                        </div>
                        <span data-i18n="chat_sugg_4">Comment se déplacer entre les villes ?</span>
                    </div>
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            </div>

            <form class="input-container" onsubmit="sendMessage(event)">
                <input type="text" id="chat-input" placeholder="Écrivez votre message..." data-i18n-placeholder="chat_input_placeholder">
                <button type="submit" class="send-btn">
                    <i class="fa-regular fa-paper-plane"></i> <span data-i18n="chat_send">Envoyer</span>
                </button>
            </form>

        </div>

    </main>

    <script src="translations.js"></script>`;

content = content.replace(regex, replacementText);
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('Restored correctly');
