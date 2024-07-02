const express = require("express");
const path = require('path');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('./../models/User');
const nodemailer = require('nodemailer');
const transporter = require('../config/nodemailer');
const fs = require('fs');
const ejs = require('ejs');
router.use(express.static("public"));

router.get("/", (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        return res.render("dashboard/adduser", { isUser, nonce });
    } catch (error) {
        return res.render("error", { error });
    }

});

// POST endpoint to handle form submission with validation
router.post('/addNewuser', [
    // Validate and sanitize fields
    body('lname-column').notEmpty().withMessage('Last name is required'),
    body('password-id-column').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#%^&+=])[^$]{8,}$/)
        .withMessage('Password must contain at least one letter, one digit, and one of the following special characters: @#%^&+='),
    body('fname-column').notEmpty().withMessage('First name is required'),
    body('email-id-column').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address')
], async (req, res) => {
    //console.log("jasser");
    //console.log(req.body);
    // Check for validation errors
    const errors = validationResult(req);
    //console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //console.log("jasser222");
    try {
        // Extract data from request body
        const { 'fname-column': fnameColumn, 'lname-column': lnameColumn, 'email-id-column': emailIdColumn, 'password-id-column': passwordIdColumn } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email: emailIdColumn });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Encrypt the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(passwordIdColumn, saltRounds);
        // Create a new user object
        const newUser = new User({
            email: emailIdColumn,
            password: hashedPassword,
            lastname: lnameColumn,
            firstname: fnameColumn
        });
        console.log(newUser);
        await newUser.save();

        const img1 = path.join(__dirname, '../public/images/CTlogo.png');
        const img2 = path.join(__dirname, '../public/images/ovclogo.png');

        const img3 = path.join(__dirname, '../public/images/email/location.png');
        const img4 = path.join(__dirname, '../public/images/email/phone.png');
        const img5 = path.join(__dirname, '../public/images/email/envelope.png');

        const img6 = path.join(__dirname, '../public/images/email/facebook_31.png');
        const img7 = path.join(__dirname, '../public/images/email/twitter_32.png');
        const img8 = path.join(__dirname, '../public/images/email/google_33.png');
        const img9 = path.join(__dirname, '../public/images/email/youtube_34.png');
        const currentYear = new Date().getFullYear();
        const baseYear = 2024;
        const yearText = currentYear === baseYear ? baseYear : `${baseYear}-${currentYear}`;

        const emailvar = { fnameColumn,lnameColumn,emailIdColumn,passwordIdColumn, yearText }
        const templatePath = path.join(__dirname, '../Emailmodels/newuser.ejs');

        fs.readFile(templatePath, 'utf8', (error, template) => {
            if (error) {
                return res.render("error", { error });
            }

            try {

                // Render the template with the variables
                const htmlContent = ejs.render(template, emailvar); // emailvar
                //console.log(htmlContent);

                const mailOptions = {
                    from: process.env.sendermail,
                    to: emailIdColumn,
                    subject: 'Bienvenue à notre nouveau membre',
                    html: htmlContent,
                    attachments: [
                        {
                            filename: 'image1.png',
                            path: img1,
                            cid: 'unique@image.1'
                        },
                        {
                            filename: 'image2.png',
                            path: img2,
                            cid: 'unique@image.2'
                        },
                        {
                            filename: 'image3.png',
                            path: img3,
                            cid: 'unique@image.3'
                        },
                        {
                            filename: 'image4.png',
                            path: img4,
                            cid: 'unique@image.4'
                        },
                        {
                            filename: 'image5.png',
                            path: img5,
                            cid: 'unique@image.5'
                        },
                        {
                            filename: 'image6.png',
                            path: img6,
                            cid: 'unique@image.6'
                        },
                        {
                            filename: 'image7.png',
                            path: img7,
                            cid: 'unique@image.7'
                        },
                        {
                            filename: 'image8.png',
                            path: img8,
                            cid: 'unique@image.8'
                        },
                        {
                            filename: 'image9.png',
                            path: img9,
                            cid: 'unique@image.9'
                        }
                    ]
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                        //return res.status(500).json({ message: "Error sending email" });
                        return res.render("error", { error });
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(201).json({ message: "User created successfully and email sent" });
                    }
                });

            } catch (error) {
                console.error(error);
                return res.status(500).json({ errors: ['Error sending email'] });
            }

        });
        // Respond with success message
        //return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        // Handle errors
        console.error(error);
        //return res.status(500).json({ message: "Internal server error" });
        return res.render("error", { error });
    }
});

module.exports = router;
