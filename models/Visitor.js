const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  formsid: [{
    type: Number
  }],
  // You can add other fields as needed
});

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
