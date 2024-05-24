const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
    title: { type: String, required: true },
    fields: String
});

// Create a MongoDB collection called "formData" using the defined schema
const FormData = mongoose.model('formData', formDataSchema);

module.exports = FormData;
