const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
    title: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true }
});

const FAQ = mongoose.model('FAQ', FAQSchema);

module.exports = FAQ;
