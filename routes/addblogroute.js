const express = require("express");
const router = express.Router();
const Blog = require('./../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
//const { Console } = require("console");
router.use(express.static("public"));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'attachments/Blog/');
    },
    filename: function (req, file, cb) {
        console.log(file.originalname);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + Date.now() + ext);
    }
    
});

const upload = multer({ storage: storage }).fields([{ name: 'filepond' }, { name: 'filepond2' }, { name: 'filepond3' }]);

// GET route for rendering the form
router.get("/", (req, res) => {
    const isUser = req.user.userRole;
    return res.render("dashboard/addblog", {isUser});
});

// POST route for submitting the form

router.post('/', async (req, res) => {
    upload(req, res, async (err) => {
        //console.log(req.body);
        //console.log(req.files);
        if (err) {
            console.error(err);
            return res.status(500).json({ errors: 'Images upload failed' });
        }

        // Validate form data
        const { 'title-blog': title, 'subtitle': subtitle, 'full-name': fullname, 'expertise': expertise, 'In-link': linkedin, 'fb-link': facebook, 'tw-link': twitter, 'Ins-link': instagram, 'wh-number': whatsapp, 'telg-number': telegram, 'tags-blog': tags_blog } = req.body;

        const errors = [];
        if (!title) errors.push('Title is required');
        if (!req.body.summernote) errors.push('Details is required');

        if (errors.length > 0) {
            if (req.files['filepond'] && req.files['filepond'].length > 0) {
                fs.unlinkSync(req.files['filepond'][0].path);
            }
            if (req.files['filepond3'] && req.files['filepond3'].length > 0) {
                fs.unlinkSync(req.files['filepond3'][0].path);
            }
            if (req.files['filepond2'] && req.files['filepond2'].length > 0) {
                req.files['filepond2'].map(file => fs.unlinkSync(file.path));
            }
            return res.status(400).json({ errors: errors });
        }


        try {
            var tagsArray = [];
            if (tags_blog) {
                const parsedTags = JSON.parse(tags_blog);

                if (Array.isArray(parsedTags)) {
                    // tags_blog is a valid JSON array
                    tagsArray = parsedTags.map(tag => tag.value);
                }
            }


            var attachaaray = [];
            if (req.files['filepond2'] && req.files['filepond2'].length > 0) {
                attachaaray = req.files['filepond2'].map(file => ({
                    originalname: file.originalname,
                    filename: file.filename,
                    path: file.path.replace(/\\/g, '/').replace('attachments/', '/'),
                }));
            }

            let Autor = {};
            if (fullname && fullname != "") {
                Autor = {
                    fullname: fullname,
                    expertise: expertise,
                    autorIMGpath: req.files['filepond3'] && req.files['filepond3'].length > 0 ? req.files['filepond3'][0].path.replace(/\\/g, '/').replace('attachments/', '/') : "/images/Default-profile.jpg",
                    socialmedia: {
                        linkedin,
                        facebook,
                        twitter,
                        instagram,
                        whatsapp,
                        telegram,
                    }
                }
            }


            // Save blog post to MongoDB
            const newBlog = new Blog({
                title,
                subtitle,
                coverIMGpath: req.files['filepond'] && req.files['filepond'].length > 0 ? req.files['filepond'][0].path.replace(/\\/g, '/').replace('attachments/', '/') : "/images/Default-cover.jpg",
                autor: Autor,
                details: req.body.summernote,
                attachments: attachaaray,
                tags: tagsArray,

            });

            await newBlog.save();
            //console.log(newBlog);

            return res.status(200).send('Blog posted successfully');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error posting Blog');
        }
    });
});
module.exports = router;
