const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('./../models/User');
const jwt = require('jsonwebtoken');
router.use(express.static("public"));
router.get("/", (req, res) => {
    return res.render("dashboard/login");
});

router.post("/verif", [
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=]).{8,}$/)
        .withMessage('Password must contain at least one letter, one digit, and one of the following special characters: @#$%^&+=')
], async (req, res) => {
    //console.log(req.body)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //console.log(errors.array());
        // Return validation errors to the client
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const checkboxStatus = req.body.checkbox;


    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ message: 'Invalid credentials' }] });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ message: 'Invalid password' }] });
        }

        // If passwords match, create a session for the user
        //req.session.user = user;

        // Redirect to dashboard or return success message
        //res.json({ msg: 'Login successful', user: user });
        // Generate JWT
        const token = jwt.sign({ userId: user._id, userFname: user.firstname, userLastname: user.lastname, userRole: user.position }, process.env.TOKEN_SECRET, { expiresIn: '60d' });
        // Check the status of the checkbox
        if (checkboxStatus == 'on') {
            // If checkbox is checked, set cookie with JWT
            res.cookie('token', token, { httpOnly: true, maxAge: 60 * 24 * 60 * 60 * 1000 }); // 60 days in milliseconds

        } else {
            // If checkbox is not checked, create session with JWT
            req.session.token = token;
        }

        return res.json({ message: 'Login successful' });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;
