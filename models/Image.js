const mongoose = require('mongoose');

// Define the schema for the video
const ImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },

});

// Create a model using the schema
const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
