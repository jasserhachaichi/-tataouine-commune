const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('./../models/User');
const nodemailer = require('nodemailer');
const transporter = require('../config/nodemailer');

router.get("/", (req, res) => {
    return res.render("dashboard/adduser");
});

// POST endpoint to handle form submission with validation
router.post('/addNewuser', [
    // Validate and sanitize fields
    body('lname-column').notEmpty().withMessage('Last name is required'),
    body('password-id-column').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=]).{8,}$/)
        .withMessage('Password must contain at least one letter, one digit, and one of the following special characters: @#$%^&+='),
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
        // Save the user to the database
        await newUser.save();


        const mailOptions = {
            from: process.env.sendermail,
            to:  emailIdColumn,
            subject: '(No Reply) Welcome to Tataouine commune Platform',
            text: `Hello ${fnameColumn},\n\nThank you for signing up. Your account has been created successfully.\n\nYour login credentials:\nEmail: ${emailIdColumn}\nPassword: ${passwordIdColumn}\n\nBest regards,\nYour Company`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: "Error sending email" });
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.status(201).json({ message: "User created successfully and email sent" });
                }
            });























        // Respond with success message
        //return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
