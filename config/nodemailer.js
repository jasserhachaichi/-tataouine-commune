const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration de NodeMailer


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.sendermail,
      pass: process.env.senderpass,
    },
  });

module.exports = transporter;
