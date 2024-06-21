const express = require("express");
const router = express.Router();
//const { body, validationResult } = require('express-validator');
const Video = require('../models/Videog');
const multer = require('multer');
const path = require('path');

/* const ffmpeg = require('fluent-ffmpeg');*/
const fs = require('fs');

/* function getYoutubeThumbnail(url) {
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
} */

router.use(express.json());

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'attachments/VIDuploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Use original file name
    }
});
const upload = multer({ storage: storage }).fields([{ name: 'video-column', maxCount: 1 }, { name: 'thumbnail-column', maxCount: 1 }]);
const uploady = multer({ storage: storage });

router.get("/", (req, res) => {
    return res.render("dashboard/addvideo");
});





router.post('/local', async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ errors: 'Files upload failed' });
        }

        let errors = [];
        const thumbnailFile = req.files['thumbnail-column'];
        //console.log(thumbnailFile);
        const videofile = req.files['video-column'];

        if (!req.body['title-column']) {
            errors.push('Title is required');
        }

        if (!req.body['description-column']) {
            errors.push('Description is required');
        }

        if (!videofile || !videofile[0]) {
            errors.push('Video is required');
        }
        var thumbnailPath;
        if(thumbnailFile &&  (thumbnailFile.length > 0)){
            thumbnailPath = thumbnailFile[0].path.replace(/\\/g, '/').replace('attachments/', '/');
        }else{
            thumbnailPath = '/images/Default-thumbnail.png';
        }
        
            
         
        

        if (errors.length > 0) {
            // Delete uploaded files if any error occurred
            if (thumbnailPath !== '/images/Default-thumbnail.png') {
                fs.unlinkSync(thumbnailFile[0].path);
            }
            if (videofile && videofile[0]) {
                fs.unlinkSync(videofile[0].path);
            }
            return res.status(400).json({ errors: errors });
        }


        try {
            var videopath = videofile[0].path.replace(/\\/g, '/').replace('attachments/', '/');
            //console.log(videopath);
            //console.log(thumbnailPath);
            const video = new Video({
                title: req.body['title-column'],
                description: req.body['description-column'],
                type: "local",
                url: videopath,
                thumbnail: thumbnailPath,
            });
            //console.log(video);

            // Save the video to the database
            await video.save();

            // Return success response
            return res.status(200).json({ message: 'Video added successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ errors: 'Internal server error' });
        }
    });
});



router.post('/youtube', uploady.single('thumbnail-column'), async (req, res) => {
    try {
        const { 'title-column': title, 'description-column': description, 'url-column': url } = req.body;
        //console.log(req.file);
        const thumbnailFile = req.file;
        let errors = [];
        //console.log("jassour1");
        // Validate form data
        if (!title) errors.push('Title is required');
        if (!description) errors.push('Description is required');
        if (!url) errors.push('URL is required');

        var thumbnailPath = thumbnailFile && thumbnailFile.path? thumbnailFile.path.replace(/\\/g, '/').replace('attachments/', '/') : '/images/Default-thumbnail.png';

        //console.log(thumbnailPath);
        //console.log("jassour 2");

        if (errors.length > 0) {
            if(thumbnailPath != '/images/Default-thumbnail.png'){
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errors });
        }
        const video = new Video({
            title,
            description,
            type: "youtube",
            url,
            thumbnail: thumbnailPath
        });
         await video.save();
        res.json({ message: 'Video uploaded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: 'Internal server error' });
    }
});








module.exports = router;
