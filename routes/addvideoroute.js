const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Video = require('../models/Videog');

const multer = require('multer');
const path = require('path');

/* const ffmpeg = require('fluent-ffmpeg');*/
const fs = require('fs'); 

function getYoutubeThumbnail(url) {
    //console.log("jasser url" + url);
    // Extract video ID from the URL
    const match = url.match(/[?&]v=([^&]+)/);
    const videoId = match && match[1];

    if (!videoId) {
        console.error('Invalid YouTube URL');
        return null;
    }

    // Construct thumbnail URL
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

router.use(express.json());

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploadsVideos/'); // Specify upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Use original file name
    }
});
const upload = multer({ storage: storage }).fields([{ name: 'video-column', maxCount: 1 }, { name: 'thumbnail-column', maxCount: 1 }]);

router.get("/", (req, res) => {
    return res.render("dashboard/addvideo");
});


// Handle POST Request
router.post('/youtube', [
    body('title-column').notEmpty().withMessage('Title is required'),
    body('url-column').notEmpty().withMessage('URL is required'),
    body('description-column').notEmpty().withMessage('Description is required'),
], async (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    //console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } 
    try {
        // Extract data from request body
        const { 'title-column': titleColumn, 'url-column': urlColumn, 'description-column': descriptionColumn } = req.body;
        //console.log(getYoutubeThumbnail(urlColumn))
        const newVideo = new Video({
            title: titleColumn,
            description: descriptionColumn,
            type: "youtube",
            url: urlColumn,
            thumbnail: getYoutubeThumbnail(urlColumn)
        });

        // Save to MongoDB
        await newVideo.save(); 

        // Respond with success message
        res.status(201).json({ message: 'Video saved successfully' });
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).json({ errors: "Internal server error" });
    }
});



// Handle POST request for uploading video
router.post('/local', async (req, res) => {
    upload(req, res, async (err) => {

        console.log(req.file);
        console.log(req.body);
        if (err) {
            console.error(err);
            return res.status(500).json({ errors: 'File upload failed' });
        }

        // Check if title, description, and video are provided
        let errors = [];

        if (!req.body['title-column']) {
            errors.push('Title is required');
        }

        if (!req.body['description-column']) {
            errors.push('Description is required');
        }

        if (!req.files['video-column'] || req.files['video-column'].length === 0) {
            errors.push('Video is required');
        }

        let newthPath = '';

        if (!req.files['thumbnail-column'] || req.files['thumbnail-column'].length === 0) {
            newthPath = 'images/Default-thumbnail.png';
        } else {
            const filethPath = req.files['thumbnail-column'][0].path;
            newthPath = filethPath.substring(filethPath.indexOf('uploadsVideos'));
        }

        if (errors.length > 0) {
                    // Remove the uploaded video and thumbnail if validation fails
        if (req.files['video-column'] && req.files['video-column'].length > 0) {
            const videoFilePath = req.files['video-column'][0].path;
            fs.unlinkSync(videoFilePath); // Remove the uploaded video
        }
        if (req.files['thumbnail-column'] && req.files['thumbnail-column'].length > 0) {
            const thumbnailFilePath = req.files['thumbnail-column'][0].path;
            fs.unlinkSync(thumbnailFilePath); // Remove the uploaded thumbnail
        }
            return res.status(400).json({ errors: errors });
        }

        const filePath = req.files['video-column'][0].path;
        const newPath = filePath.substring(filePath.indexOf('uploadsVideos'));

        try {
            // Create a new video document using the received form data
            const video = new Video({
                title: req.body['title-column'],
                description: req.body['description-column'],
                type: "local",
                url: newPath,
                thumbnail: newthPath,
            });

            // Save the video document to MongoDB
            await video.save();

            res.status(201).json({ message: 'Video uploaded successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ errors: 'Internal server error' });
        }
    });
});











module.exports = router;
