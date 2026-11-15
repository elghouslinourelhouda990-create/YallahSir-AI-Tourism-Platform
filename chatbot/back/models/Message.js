const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id_conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  contenu_message: { 
    type: String, 
    required: true 
  },
  expediteur: { 
    type: String, 
    enum: ['USER', 'BOT'], 
    required: true 
  },
  date_envoi: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Message', MessageSchema);
