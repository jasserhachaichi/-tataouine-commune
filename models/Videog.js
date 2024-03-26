const mongoose = require('mongoose');

// Define the schema for the video
const videogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['youtube', 'local'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null,
  }
}, {
  timestamps: true
});

// Create a model using the schema
const Videog = mongoose.model('Videog', videogSchema);

module.exports = Videog;
