const express = require("express");
const router = express.Router();
const Announcement = require('./../models/Announcement');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const upload = multer({ storage: storage }).fields([{ name: 'filepond' }]);

// GET route for rendering the form
router.get("/", (req, res) => {
    res.render("dashboard/addpost");
});

// POST route for submitting the form
router.post('/', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ errors: 'Image upload failed' });
        }
        // Validate form data
        const { 'title-column': titleColumn, 'appel-column': appel, 'Expired-column': expiredDate } = req.body;
        const errors = [];
        if (!titleColumn) errors.push('Title is required');
        if (!appel) errors.push('Appel de is required');
        if (!expiredDate) errors.push('Expired day is required');
        if (req.body.summernote == "<p><br></p>") errors.push('Description is required');
        if (!req.files['filepond'] || req.files['filepond'].length === 0 ) errors.push('Image is required');

        if (errors.length > 0) {
            const imagePath = req.files['filepond'][0].path;
            fs.unlinkSync(imagePath);

            return res.status(400).json({ errors: errors });
        }

        try {


            const filePath = req.files['filepond'][0].path;
            const newPath = filePath.substring(filePath.indexOf('AnnouncementIMG'));

            // Create new announcement instance
            const newAnnouncement = new Announcement({
                title: titleColumn,
                appel: appel,
                expiredDate: expiredDate,
                path: newPath,
                details: req.body.summernote,
            });
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
