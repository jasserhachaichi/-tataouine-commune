const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('./../models/User');
const jwt = require('jsonwebtoken');
router.use(express.static("public"));
router.get("/", (req, res) => {
    const nonce = res.locals.nonce;
    try {
        return res.render("dashboard/login", { nonce });
    } catch (error) {
        return res.render("error", { error });
    }
});
/*  router.get("/saveusers", async (req, res) => {
    const users = [
        {"email": "hachjasser096@gmail.com", "password": "$2b$10$889jzFgOx95tr9dqUSrqV.wAd5Fe6JxSp0VO.2TMZco/0aAQL/I2W", "lastname": "Hach", "firstname": "Jasser", "position": "admin"},
        {"email": "jassour7777@gmail.com", "password": "$2b$10$PzOWqs4v6M3Hopd8GGa6FeJoMbxvbZT9nqRrFCJFQr2vtgsp12A.S", "lastname": "lar", "firstname": "test", "position": "user"},
        {"email": "laroussijasser9@gmail.com", "password": "$2b$10$8y8uVqTJQTETMADs08f76.MotaGrGXUTJ95VU5uaE5h08BGzyEYcC", "lastname": "Hachaichi", "firstname": "Jasser", "position": "user"}
    ];

    try {
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
        }
        res.status(200).json({ message: "Users saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error saving users", error });
    }
}); */

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

    const  email= req.body.email;
    const  password  = req.body.password;
    const checkboxStatus = req.body.checkboxinput;


    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ message: 'Invalid credentials (Email or Password).' }] });
        }
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({ errors: [{ message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' }] });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await user.incrementFailedLoginAttempts();
            return res.status(400).json({ errors: [{ message: 'Invalid password' }] });
        };
        await user.resetFailedLoginAttempts();

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
            //req.session.token = token;
            res.cookie('token', token, { httpOnly: true });
        }

        return res.json({ message: 'Login successful' });
    } catch (error) {
        //console.error(err.message);
        //return res.status(500).send('Server Error');
        return res.render("error", { error });
    }
});

module.exports = router;
