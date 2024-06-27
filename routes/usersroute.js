const express = require("express");
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const transporter = require('../config/nodemailer');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const fs = require('fs');
const ejs = require('ejs');
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
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        // Fetch users whose position is not "admin" and exclude the password field
        const users = await User.find({ position: { $ne: 'admin' } }, '-password');
        return res.render("dashboard/users", { users, isUser, nonce });

    } catch (error) {
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});
router.get("/admin", async (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        // Find the admin user
        const adminUser = await User.findOne({ position: 'admin' });

        // Check if admin user exists
        if (!adminUser) {
            // If admin user not found, redirect to a 404 page or handle it as you see fit
            return res.redirect("/404");
        }

        // Render the admin dashboard template and pass the admin user data to it
        return res.render("dashboard/admin", { adminUser, isUser, nonce });

    } catch (error) {
        // If an error occurs, redirect to a 404 page or handle it as you see fit
        console.error(error);
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});


router.get("/delete/:userId", async (req, res) => {
    const idu = req.params.userId;
    console.log(idu);
    try {
        if (mongoose.Types.ObjectId.isValid(idu)) {
            //return res.status(400).json({ message: "Invalid user ID format" });
            //const user = await User.findById(req.params.userId);
            await User.deleteOne({ _id: idu });
        }
        return res.redirect("/users");
    } catch (error) {
        //console.error(error);
        //return res.status(500).send("Internal Server Error");
        return res.render("error", { error });
    }
});

router.post('/key/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

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
        //const lastname = existingUser.lastname;
        const email = existingUser.email;


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

        const emailvar = { passwordIdColumn, yearText }
        const templatePath = path.join(__dirname, '../Emailmodels/userpwd.ejs');
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
                    to: email,
                    subject: "Mise à jour de votre mot de passe",
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
                        return res.status(500).json({ message: "Error sending email" });
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(201).json({ message: `Password updated and sent to ${firstname} in email successfully.` });
                    }
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ errors: ['Error sending email'] });
            }

        });
    } catch (error) {
        console.error(error);
        //return res.status(500).send('Internal Server Error');
        return res.render("error", { error });
    }
});


router.post("/forgot-password", async (req, res) => {
    console.log("test 1 2 3 ");
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

        const emailvar = { password, yearText }
        const templatePath = path.join(__dirname, '../Emailmodels/adminpwd.ejs');

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
                    to: adminUser.email,
                    subject: "Demande de réinitialisation de mot de passe",
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

                transporter.sendMail(mailOptions);

                return res.status(200).json({ message: "Un e-mail de réinitialisation de mot de passe a été envoyé à l'administrateur" });




            } catch (error) {
                console.error(error);
                return res.status(500).json({ errors: ['Error sending email'] });
            }

        });


    } catch (error) {
        console.error(error);
        //return res.status(500).json({ message: "Erreur interne du serveur" });
        return res.render("error", { error });
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
                let destemail = existingUser.email;
                if (fnameColumn && fnameColumn.length > 1) {
                    existingUser.firstname = fnameColumn;
                }
                if (lnameColumn && lnameColumn.length > 1) {
                    existingUser.lastname = lnameColumn;
                }
                if (emailIdColumn && emailIdColumn.length > 6) {
                    existingUser.email = emailIdColumn;
                    destemail = emailIdColumn;
                }
                if (validatePassword(passwordIdColumn) && (passwordIdColumn > 7) && passwordIdColumn) {
                    const saltRounds = 10;
                    existingUser.password = await bcrypt.hash(passwordIdColumn, saltRounds);
                }

                await existingUser.save();


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

                const emailvar = { fnameColumn, lnameColumn, emailIdColumn, passwordIdColumn, yearText };
                const templatePath = path.join(__dirname, '../Emailmodels/admininfo.ejs');

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
                            to: destemail,
                            subject: "Mise à jour de vos informations",
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
                                //console.error(error);
                                return res.status(500).json({ message: "Error sending email" });
                            } else {
                                console.log('Email sent: ' + info.response);
                                return res.status(201).json({ message: "Admin information updated successfully" });
                            }
                        });
                    } catch (error) {
                        console.error(error);
                        return res.status(500).json({ errors: ['Error sending email'] });
                    }

                });

                
            } else {
                return res.status(400).json({ errors: 'Old password incorrect' });
            }
        }


    } catch (error) {
        console.error(error);
        //return res.status(500).json({ message: "Internal server error" });
        return res.render("error", { error });
    }
});


module.exports = router;
