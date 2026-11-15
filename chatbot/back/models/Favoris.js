const mongoose = require('mongoose');

const FavorisSchema = new mongoose.Schema({
  ID_USER: { type: String, required: true },
  type_favori: { type: String },
  item_title: { type: String }
}, { strict: false });

module.exports = mongoose.model('Favoris', FavorisSchema, 'favoris');
