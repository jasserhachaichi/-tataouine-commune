const express = require('express');
const path = require('path');
const router = express.Router();
const Email = require('./../models/Email');
const methodOverride = require('method-override');
const fs = require('fs');
const ejs = require('ejs');
const multer = require('multer');
const transporter = require('../config/nodemailer');
const followerModel = require('./../models/Follower');

router.use(express.static('public'));



// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Override POST requests with DELETE method if "_method" is provided in the form
router.use(methodOverride('_method'));

// Backend route for searching emails
router.get('/', async (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    const page = req.query.page || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    try {
        let query = {};
        if (req.query.search) {
            query = {
                $or: [
                    { subject: { $regex: req.query.search, $options: 'i' } },
                    { message: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }

        const totalCount = await Email.countDocuments(query); // Count total matching documents

        const emails = await Email.find(query)
            .skip(skip)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();

        const totalPages = Math.ceil(totalCount / perPage);

        return res.render("dashboard/inbox", { emails, currentPage: page, perPage, totalCount, totalPages, isUser, nonce });
    } catch (error) {
        console.error(error);
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});
router.get("/emailcreator", (req, res) => {
    //console.log("azeeeeeeeeee");
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        return res.render("dashboard/emailcreator", { isUser, nonce });
    } catch (error) {
        return res.render("error", { error });
    }
});

router.get("/followers", async (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        const followers = await followerModel.find({});
        return res.render("dashboard/allfollowers", { followers, isUser, nonce });
    } catch (error) {
        console.error(error);
        //return res.status(500).send("An error occurred while fetching followers.");
        return res.render("error", { error });
    }
});
router.get('/follower/:id', async (req, res) => {
    try {
        const idf = req.params.id;
        await followerModel.findByIdAndDelete(idf);
        return res.redirect("/emailbox/followers");
    } catch (error) {
        console.error(error);
        //return res.status(500).send({ message: "An error occurred while deleting the follower." });
        return res.render("error", { error });
    }
});



router.get("/:id", async (req, res) => {
    const nonce = res.locals.nonce;
    try {
        const isUser = req.userRole;
        const emailId = req.params.id;
        const email = await Email.findById(emailId);

        if (!email) {
            return res.redirect("/emailbox");
        }

        if (!email.isOpen) {
            email.isOpen = true;
            await email.save();
        }

        return res.render('dashboard/email', { email, isUser, nonce });
    } catch (error) {
        console.error(error);
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});

router.delete('/:id', async (req, res) => {
    const emailId = req.params.id;

    try {
        const deletedEmail = await Email.findByIdAndDelete(emailId);
        if (!deletedEmail) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Supprimer les fichiers d'attachement du serveur
        deletedEmail.attachments.forEach(attachment => {
            try {
                const attpath = path.join(__dirname, '../attachments', attachment.path);
                if (fs.existsSync(attpath)) {
                    fs.unlinkSync(attpath);
                }
                //console.log(`Attachment deleted: ${attachment.filename}`);
            } catch (err) {
                console.error(`Error deleting attachment ${attachment.filename}: ${err}`);
            }
        });

        return res.redirect("/emailbox");
    } catch (error) {
        console.error(error);
        //return res.redirect("/emailbox");
        return res.render("error", { error });
    }
});


router.post('/emailcreator', upload.array('filepond'), async (req, res) => {
    console.log(req.body);
    console.log(req.files);
    const { subject, summernote } = req.body;
    const files = req.files;

    try {
        // Retrieve followers' emails from MongoDB
        const followers = await followerModel.find({}, { email: 1, _id: 0 });

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
        const emailvar = { summernote, yearText }
        const templatePath = path.join(__dirname, '../Emailmodels/followers.ejs');




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
                    to: followers.map(follower => follower.email),
                    subject: subject,
                    html: htmlContent,
                    attachments: [
                        ...files.map(file => ({
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
                        console.error(error);
                        return res.status(500).send('Error sending email');
                    } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(200).send('Emails sent successfully');
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

    } catch (error) {
        console.error(error);
        if (req.files && req.files.length > 0) {
            req.files.map(file => fs.unlinkSync(file.path));
        }
        //return res.status(500).send('Error retrieving followers or sending email');
        return res.render("error", { error });
    }

});








module.exports = router;
