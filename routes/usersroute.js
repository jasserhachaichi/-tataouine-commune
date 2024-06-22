const express = require("express");
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const transporter = require('../config/nodemailer');
const bcrypt = require('bcrypt');
router.use(express.static("public"));



function validatePassword(password) {
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=]).{8,}$/;
    if (passwordRegex.test(password)) {
        return true;
    } else {
        return false;
    }
}

router.get("/", async (req, res) => {
    const isUser = req.user.userRole;
    try {
        const users = await User.find();
        return res.render("dashboard/users", { users, isUser });

    } catch (error) {
        return res.redirect("/404");
    }
});
router.get("/admin", async (req, res) => {
    const isUser = req.user.userRole;
    try {
        // Find the admin user
        const adminUser = await User.findOne({ position: 'admin' });

        // Check if admin user exists
        if (!adminUser) {
            // If admin user not found, redirect to a 404 page or handle it as you see fit
            return res.redirect("/404");
        }

        // Render the admin dashboard template and pass the admin user data to it
        return res.render("dashboard/admin", { adminUser, isUser });

    } catch (error) {
        // If an error occurs, redirect to a 404 page or handle it as you see fit
        console.error(error);
        return res.redirect("/404");
    }
});


router.get("/delete/:userId", async (req, res) => {
    try {
        //const user = await User.findById(req.params.userId);
        await User.deleteOne({ _id: req.params.userId });

        return res.redirect("/users");
    } catch (error) {
        //console.error(error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post('/key/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { 'password-id-column': passwordIdColumn } = req.body;
        // Check if user exists
        const existingUser = await User.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Encrypt the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(passwordIdColumn, saltRounds);
        // Update user password
        existingUser.password = hashedPassword;
        await existingUser.save();

        const firstname = existingUser.firstname;
        const lastname = existingUser.lastname;
        const email = existingUser.email;

        const mailOptions = {
            from: process.env.sendermail,
            to: email,
            subject: '(No Reply) Tataouine commune site mot de passe',
            text: `Hello ${firstname} ${lastname},\n\nThank you for signing up. Your account has been created successfully.\n\nYour login credentials:\nEmail: ${email}\nPassword: ${passwordIdColumn}\n\nBest regards,\nTataouine commune`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Error sending email" });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(201).json({ message: `Password updated and sent to ${firstname} in email successfully.` });
            }
        });




    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});


router.post("/forgot-password", async (req, res) => {
    try {
        const adminUser = await User.findOne({ position: 'admin' });

        if (!adminUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&+=";
        let password = "";
        for (let i = 0; i < 15; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        adminUser.password = hashedPassword;

        await adminUser.save();

        const mailOptions = {
            from: process.env.sendermail,
            to: adminUser.email, // Adresse e-mail de l'administrateur
            subject: '(No Replay) Demande de réinitialisation de mot de passe',
            text: `Un utilisateur a demandé la réinitialisation de son mot de passe. Voici votre nouveau mot de passe généré automatiquement: ${password}  \n\nVous avez la possibilité de le changer manuellement sur le site.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Un e-mail de réinitialisation de mot de passe a été envoyé à l'administrateur" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
});
router.post('/updateadmin', async (req, res) => {
    try {
        //console.log(req.body);
        const { 'fname-column': fnameColumn, 'lname-column': lnameColumn, 'email-id-column': emailIdColumn, 'password-id-column': passwordIdColumn, 'pwdold-id-column': pwdoldIdColumn } = req.body;
        let existingUser = await User.findOne({ position: 'admin' });
        //console.log(existingUser);

        if (existingUser) {
            const isMatch = await bcrypt.compare(pwdoldIdColumn, existingUser.password);
            //console.log(isMatch);
            if (isMatch) {
                const destemail = existingUser.email;
                let text = `Hello ${fname},\n\nDear user. Your account informations has been updated successfully.\n\n`;

                if (fnameColumn && fnameColumn.length > 1) {
                    existingUser.firstname = fnameColumn;
                    text += `First Name: ${fnameColumn}\n`;
                }
                if (lnameColumn && lnameColumn.length > 1) {
                    existingUser.lastname = lnameColumn;
                    text += `Last Name: ${lnameColumn}\n`;
                }
                if (emailIdColumn && emailIdColumn.length > 6) {
                    existingUser.email = emailIdColumn;
                    destemail = emailIdColumn;
                    text += `Email: ${destemail}\n`;
                }
                if (validatePassword(passwordIdColumn) && (passwordIdColumn > 7) && passwordIdColumn) {
                    const saltRounds = 10;
                    existingUser.password = await bcrypt.hash(passwordIdColumn, saltRounds);
                    //console.log('Password is valid.');
                    text += `Password: ${passwordIdColumn}`;
                }
                await existingUser.save();

                text += `\n\nBest regards,\nTatouine commune`;

                const mailOptions = {
                    from: process.env.sendermail,
                    to: destemail,
                    subject: '(No Reply) Tataouine commune Platform',
                    text:text
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        //console.error(error);
                        return res.status(500).json({ message: "Error sending email" });
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(201).json({ message: "Admin information updated successfully" });
                    }
                });
            } else {
                return res.status(400).json({ errors:'Old password incorrect'});
            }


        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router;
