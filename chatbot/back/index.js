const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Vérification de base
app.get('/', (req, res) => {
  res.send('API Backend démarrée');
});

// Importation des modèles
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Favoris = require('./models/Favoris');

// Initialiser l'API Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route pour récupérer les conversations d'un utilisateur
app.get('/api/conversations/:id_USER', async (req, res) => {
  try {
    const conversations = await Conversation.find({ id_USER: req.params.id_USER }).sort({ date_creation: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les messages d'une conversation
app.get('/api/messages/:id_conversation', async (req, res) => {
  try {
    const messages = await Message.find({ id_conversation: req.params.id_conversation }).sort({ date_envoi: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour envoyer un message au chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { id_USER, id_conversation, message } = req.body;
    
    if (!id_USER || !message) {
      return res.status(400).json({ error: "id_USER et message obligatoires" });
    }

    let conversation;
    let isNewConversation = false;
    // Récupérer la conversation existante ou en créer une nouvelle
    if (id_conversation) {
      conversation = await Conversation.findById(id_conversation);
    }
    
    if (!conversation) {
      conversation = new Conversation({ 
        id_USER,
        titre_conversation: message.length > 30 ? message.substring(0, 30) + '...' : message
      });
      await conversation.save();
      isNewConversation = true;
    }

    // Enregistrer le message de l'utilisateur
    const userMessage = new Message({
      id_conversation: conversation._id,
      contenu_message: message,
      expediteur: 'USER'
    });
    await userMessage.save();

    // Fetch past messages to build history
    const pastMessages = await Message.find({ id_conversation: conversation._id }).sort({ date_envoi: 1 });
    const history = pastMessages.map(msg => ({
      role: msg.expediteur === 'USER' ? 'user' : 'model',
      parts: [{ text: msg.contenu_message }]
    }));
    // Note: the current userMessage is already saved and included in pastMessages above.
    
    // Fetch user favoris for personalization
    const userFavoris = await Favoris.find({ ID_USER: id_USER });
    let favorisContext = "";
    if (userFavoris && userFavoris.length > 0) {
      const favList = userFavoris.map(f => `${f.type_favori} (${f.item_title})`).join(', ');
      favorisContext = `\n\nUSER PREFERENCES:\nThe user has added these items to their favorites: ${favList}. Use this knowledge to personalize your recommendations when relevant.`;
    }

    // Vérification de la clé API
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'VOTRE_CLE_API_GEMINI_ICI') {
       return res.status(500).json({ error: "Clé API Gemini non configurée dans le fichier .env" });
    }
    const systemPrompt = `You are a smart tourist guide chatbot for Morocco. You are enthusiastic, modern, and helpful. You act like a local Moroccan guide.

Your role is to help users discover places, activities, culture, and events related to Morocco 2030 (World Cup).

You must:
- Answer in a friendly and helpful tone
- Give short and clear answers
- Suggest places, activities, or services when possible
- Personalize recommendations based on user requests
- If the user asks in French, reply in French
- If the user asks in Arabic, reply in Arabic

You have access to a database of:
- tourist places
- cultural activities
- services

When possible:
- recommend 2 or 3 options
- explain briefly why they are good

Do NOT:
- give long boring answers
- go خارج الموضوع

If you don't know the answer:
- say "I’m not sure, but here are some suggestions"

If a user asks for a place:
- suggest similar places
- suggest nearby activities${favorisContext}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // updated to a more stable specifier
      systemInstruction: systemPrompt
    });
    
    // Instead of generateContent(message), we use the history if we have past messages
    let botResponseText = "";
    try {
        if (history.length > 1) { // more than just the current message
             // We pop the last message (current user message) to use in sendMessage
             const currentMsg = history.pop();
             const chatSession = model.startChat({ history: history });
             const result = await chatSession.sendMessage(currentMsg.parts[0].text);
             botResponseText = result.response.text();
        } else {
             const result = await model.generateContent(message);
             botResponseText = result.response.text();
        }
    } catch (e) {
        console.error("Gemini Generation Error:", e);
        throw e;
    }

    // Enregistrer le message du bot
    const botMessage = new Message({
      id_conversation: conversation._id,
      contenu_message: botResponseText,
      expediteur: 'BOT'
    });
    await botMessage.save();

    // Renvoyer les informations de la conversation et les messages
    res.json({
      conversation_id: conversation._id,
      titre_conversation: conversation.titre_conversation,
      message_utilisateur: userMessage,
      reponse_bot: botMessage
    });
  } catch (error) {
    console.error("Erreur Chatbot API:", error);
    res.status(500).json({ error: "Erreur serveur lors de la génération de réponse: " + error.message });
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB (base pfa)');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
  });
