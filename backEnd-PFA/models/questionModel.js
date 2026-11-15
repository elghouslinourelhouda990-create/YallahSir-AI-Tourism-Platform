const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    _id: Number,
    type: String,
    question: Object,
    options: Array
});

module.exports = mongoose.model('Question', questionSchema);
