const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  id_USER: { 
    type: String, 
    required: true 
  },
  titre_conversation: { 
    type: String, 
    default: "Nouvelle discussion" 
  },
  date_creation: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Conversation', ConversationSchema);
