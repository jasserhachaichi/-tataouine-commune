const express = require("express");
const router = express.Router();
const transporter = require('../config/nodemailer');
const multer = require('multer');
const path = require('path');
const Recaptcha = require('express-recaptcha').RecaptchaV3;
const Email = require('./../models/Email');
const fs = require('fs');
const ejs = require('ejs');
router.use(express.static("public"));

// Create a new instance of Recaptcha
//const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);

router.get("/", (req, res) => {
    const nonce = res.locals.nonce;
    var siteKey = process.env.RECAPTCHA_SITE_KEY;
    try {
        return res.render("contact", { siteKey: siteKey, nonce });
    } catch (error) {
        return res.render("error", { error });
    }
});
function getRandomNumber(maxLength) {
    const max = Math.pow(10, maxLength) - 1;
    return Math.floor(Math.random() * max);
}
// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'attachments/email/') // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const randomNum = getRandomNumber(7);
        cb(null, file.fieldname + '-' + randomNum + "ETC" + '-' + Date.now() + ext);
    }
});
const upload = multer({ storage: storage });
// Set up route for handling form submission
// Endpoint to handle form submission
router.post('/sendEmail', upload.array('filepond'), async (req, res) => {
    const grecaptcha = req.body['g-recaptcha-response']; // Get the response from Google's reCaptcha
    try {
       // console.log(req.body);

       // console.log(req.files);
        if (!grecaptcha || grecaptcha == '') {
            if (req.files && req.files.length > 0) {
                req.files.map(file => fs.unlinkSync(file.path));
            }
            return res.status(400).json({ errors: ['reCAPTCHA is required'] });
        } else {
            const { fullname, email, tel, subject, message, country, checkbox } = req.body

            // Check if the checkbox is checked
            if (!checkbox || checkbox != "on") {
                if (req.files && req.files.length > 0) {
                    req.files.map(file => fs.unlinkSync(file.path));
                }
                return res.status(400).json({ errors: ['Checkbox not checked'] });
            } else {
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
                    if (req.files && req.files.length > 0) {
                        req.files.map(file => fs.unlinkSync(file.path));
                    }
                    return res.status(400).json({ errors: errors });
                }
                // Log file information to console
                req.files.forEach(file => {
                    console.log(`File uploaded: ${file.originalname}, size: ${file.size} bytes, path: ${file.path}`);
                });


                const newEmail = new Email({
                    fullname,
                    email,
                    tel,
                    subject,
                    message,
                    country,
                    attachments: req.files.map(file => ({
                        filename: file.originalname,
                        path: file.path.replace(/\\/g, '/').replace('attachments/', '/')
                    }))
                });
                await newEmail.save();

                if (email) {
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

                    //console.log(logoimgPath);
                    const emailvar = { fullname, email, tel, subject, message, country,yearText  }
                    const templatePath = path.join(__dirname, '../Emailmodels/contact.ejs');
                    fs.readFile(templatePath, 'utf8', (error, template) => {
                        if (error) {
                            if (req.files && req.files.length > 0) {
                                req.files.map(file => fs.unlinkSync(file.path));
                            }
                            return res.status(500).json({ error: 'Error reading email template' });
                        }

                        try {

                            // Render the template with the variables
                            const htmlContent = ejs.render(template, emailvar); // emailvar
                            //console.log(htmlContent);

                            const mailOptions = {
                                from: process.env.sendermail,
                                to: email,
                                subject: "Copie de votre email dans Site Tatouine",
                                html: htmlContent,
                                attachments: [
                                    ...req.files.map(file => ({
                                        filename: file.originalname,
                                        path: file.path
                                    })),
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
                                    console.log(error);
                                    //return res.status(500).json({ errors: ['Error sending email'] });
                                    //return res.render("error", { error });
                                    res.status(500).send('Error sending email');
                                } else {
                                    console.log('Email sent: ' + info.response);
                                    return res.status(200).json({ message: 'Email sent successfully' });
                                }
                            }); 
                        } catch (error) {
                            if (req.files && req.files.length > 0) {
                                req.files.map(file => fs.unlinkSync(file.path));
                            }
                            console.error(error);
                            return res.status(500).json({ errors: ['Error sending email'] });
                        }


                    });



                } else {
                    return res.status(200).json({ message: 'Email sent successfully' });
                }





                //console.log('Email sent successfully');
            }
        }

    } catch (error) {
        if (req.files && req.files.length > 0) {
            req.files.map(file => fs.unlinkSync(file.path));
        }
        return res.render("error", { error });
    }
});
module.exports = router;
