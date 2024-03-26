const express = require("express");
const router = express.Router();
const multer = require('multer');
const transporter = require('../config/nodemailer');
const followerModel = require('./../models/Follower');

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get("/", (req, res) => {
    return res.render("dashboard/emailcreator");
});

router.post('/', upload.array('filepond'), async (req, res) => {
    console.log(req.body);
    console.log(req.files);
    const { subject, summernote } = req.body;
    const files = req.files;
  
    try {
      // Retrieve followers' emails from MongoDB
      const followers = await followerModel.find({}, { email: 1, _id: 0 });
  
      // Construct email message
      const mailOptions = {
        from: process.env.sendermail,
        bcc: followers.map(follower => follower.email),
        subject: subject,
        html: summernote,
        attachments: files.map(file => ({
          filename: file.originalname,
          content: file.buffer,
        })),
      };
  
      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).send('Error sending email');
        } else {
          console.log('Email sent: ' + info.response);
          res.status(200).send('Emails sent successfully');
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving followers or sending email');
    }
    
  });
  
module.exports = router;
