const mongoose = require("mongoose");
//const Schema = mongoose.Schema;

const followerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  }
});

const follower = mongoose.model('follower', followerSchema);

module.exports = follower;

