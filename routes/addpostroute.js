const express = require("express");
const router = express.Router();
const Announcement = require('./../models/Announcement');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('./../models/FormData');
router.use(express.static("public"));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'attachments/AnnouncementIMG/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage }).fields([{ name: 'filepond' }, { name: 'filepond2' }]);

// GET route for rendering the form
router.get("/", (req, res) => {
    const isUser = req.user.userRole;
    res.render("dashboard/addpost", {isUser});
});

// POST route for submitting the form
router.post('/', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ errors: 'Image upload failed' });
        }
        console.log(req.body);
        console.log(req.files);
        // Validate form data
        const { 'title-column': titleColumn, 'appel-column': appel, 'Expired-column': expiredDate } = req.body;
        const errors = [];
        if (!titleColumn) errors.push('Title is required');
        if (!expiredDate) errors.push('Expired day is required');
        if (req.body.summernote.trim() == "<p><br></p>" || req.body.summernote.trim() == "") errors.push('Details is required');
        var formLink = req.body.formLink;
        var formSource = req.body.formSource;

        if (formSource && formSource == "LF" && formLink && formLink.trim().length > 0) {
            if (formLink && formLink.trim().length > 0 ) {
                const formDataExists = await FormData.exists({ _id: formLink });
                if (!formDataExists) {
                    errors.push("Formulaire locale n'est pas trouver");
                }
            }
        }


        if (errors.length > 0) {
            if (req.files['filepond'] && req.files['filepond'].length > 0) {
                fs.unlinkSync(req.files['filepond'][0].path);
            }
            if (req.files['filepond2'] && req.files['filepond2'].length > 0) {
                req.files['filepond2'].map(file => fs.unlinkSync(file.path));
            }
            return res.status(400).json({ errors: errors });
        }
        var attachaaray = [];
        if (req.files['filepond2'] && req.files['filepond2'].length > 0) {
            attachaaray = req.files['filepond2'].map(file => ({
                originalname: file.originalname,
                filename: file.filename,
                path: file.path.replace(/\\/g, '/').replace('attachments/', '/'),
            }));
        }

        try {
            var newPath;
            if (req.files['filepond'] && req.files['filepond'].length > 0) {
                 newPath = req.files['filepond'][0].path.replace(/\\/g, '/').replace('attachments/', '/');
            }
            // Create new announcement instance
            const newAnnouncement = new Announcement({
                title: titleColumn,
                appel: appel,
                expiredDate: expiredDate,
                path:  newPath,
                details: req.body.summernote,
                attachments: attachaaray,
            });

            if (formSource && formSource.trim().length > 0 && formLink && formLink.trim().length > 0) {
                if (formSource == "LF") {
                    newAnnouncement.formSource = formSource;
                    newAnnouncement.formLink = "/form/" + formLink;
                }
                else if (formSource == "Another") {
                    newAnnouncement.formSource = formSource;
                    newAnnouncement.formLink = formLink;
                }

            }

            console.log(newAnnouncement);




            // Save the new announcement
            await newAnnouncement.save();
            return res.status(200).send('Announcement posted successfully');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error posting announcement');
        }
    });
});

module.exports = router;
