const express = require("express");
const router = express.Router();
const transporter = require('../config/nodemailer');
const multer = require('multer');
const path = require('path');
const Recaptcha = require('express-recaptcha').RecaptchaV3;
const Email = require('./../models/Email');

// Create a new instance of Recaptcha
const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

router.get("/", (req, res) => {
    var siteKey = process.env.RECAPTCHA_SITE_KEY;
    return res.render("contact", { siteKey: siteKey });
});

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Attachments/email/') // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() +"ETC"+file.originalname)
    }
});
const upload = multer({ storage: storage });
// Set up route for handling form submission
// Endpoint to handle form submission
router.post('/sendEmail' , upload.array('filepond') , async (req, res) => {
    const grecaptcha = req.body['g-recaptcha-response']; // Get the response from Google's reCaptcha

    console.log(req.body);

    console.log(req.files);
    if (!grecaptcha || grecaptcha =='' ){
        return res.status(400).json({ errors: ['reCAPTCHA is required'] });
    }else{
        const { fullname, email, tel, subject, message, country, checkbox  } = req.body

            // Check if the checkbox is checked
    if (!checkbox || checkbox != "on") {
        return res.status(400).json({ errors: ['Checkbox not checked'] });
    }else{
        let errors = [];

        // Check if any required field is missing
        if (!fullname) {
            errors.push("Fullname is required");
        }
        if (!tel) {
            errors.push("Phone number is required");
        }
        if (!subject) {
            errors.push("Subject is required");
        }
        if (subject.length > 120) {
            errors.push("Subject cannot exceed 120 characters");
        }
        if (!message) {
            errors.push("Message is required");
        }
        if (!country) {
            errors.push("Country code is required");
        }
        if (errors.length > 0) {
            return res.status(400).json({ errors: errors });
        }
        // Log file information to console
        req.files.forEach(file => {
            console.log(`File uploaded: ${file.originalname}, size: ${file.size} bytes, path: ${file.path}`);
        });
    
        //return res.status(200).json({message : 'Email sent successfully'});

        const newEmail = new Email({
            fullname,
            email,
            tel,
            subject,
            message,
            country,
            attachments: req.files.map(file => ({
                filename: file.originalname,
                path: file.path
            }))
        });
        await newEmail.save();

        if (email){
            const mailOptions = {
                from: process.env.sendermail,
                to: email,
                subject: subject,
                text: fullname + "<br>" + tel + "<br>" + message,
                attachments: req.files.map(file => ({
                    filename: file.originalname,
                    path: file.path
                }))
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ errors: ['Error sending email'] });
                    //res.status(500).send('Error sending email');
                } else { 
                    console.log('Email sent: ' + info.response);
                     return res.status(200).json({message : 'Email sent successfully'});
               }
            });  
        }else{
            return res.status(200).json({message : 'Email sent successfully'});
        }


    

       
        //console.log('Email sent successfully');
    }
    }

 

});
module.exports = router;
