const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route pour envoyer un message au chatbot
router.post('/', chatbotController.handleMessage);

// Route pour récupérer les conversations d'un utilisateur
router.get('/conversations/:id_USER', chatbotController.getConversations);

// Route pour récupérer les messages d'une conversation
router.get('/messages/:id_conversation', chatbotController.getMessages);

module.exports = router;
