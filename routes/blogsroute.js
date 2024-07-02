const express = require("express");
const path = require('path');
const router = express.Router();
const Blog = require('./../models/Blog');
const transporter = require('../config/nodemailer');
const fs = require('fs');
const ejs = require('ejs');
const mongoose = require('mongoose');

router.use(express.static("public"));

// Define isNewBlog function
function isNewBlog(createdAt) {
    const blogCreationDate = new Date(createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - blogCreationDate) / (1000 * 60 * 60 * 24));
    const newBlogThresholdDays = 7; // 7 days
    return daysDifference <= newBlogThresholdDays;
}
function formatDateC(originalDate) {

    // Transformer la date et l'heure selon le format souhaité
    const formattedDate = new Date(originalDate.getTime() + (24 * 60 * 60 * 1000)); // Soustraire 1 jour
    const formattedDateString = formattedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const formattedTimeString = formattedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

    const finalFormattedDate = `${formattedDateString.toUpperCase()} AT ${formattedTimeString}`;

    return finalFormattedDate;
}

router.get("/", async (req, res) => {
    const nonce = res.locals.nonce;
    try {
        let query = {};
        const { search, page } = req.query;
        const perPage = 6; // Number of blogs per page
        const pageNumber = parseInt(page) || 1; // Current page number, default to 1

        // If search term is provided, filter by title, subtitle, and details
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { subtitle: { $regex: search, $options: 'i' } },
                    { details: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Calculate skip value based on current page number
        const skip = (pageNumber - 1) * perPage;

        var blogs = await Blog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage); // Limit number of results per page

        return res.render("blogs", {
            blogs: blogs,
            currentPage: pageNumber,
            totalPages: Math.ceil(await Blog.countDocuments(query) / perPage),
            search: search,
            isNewBlog: isNewBlog, nonce
        });
    } catch (error) {
        console.error(error);
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});
router.get('/:id', async (req, res) => {
    const blogId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
        return res.redirect("/404");
    }
    const limit = 2;

    const nonce = res.locals.nonce;

    try {
        //const blog = await Blog.findById(blogId).select('-comments');
        var blog = await Blog.findByIdAndUpdate(blogId, { $inc: { nb_views: 1 } }, { new: true }).select('-comments');
        if (!blog) {
            return res.redirect("/404");
        }
        blog.attachments.forEach(att => {
            att.path = att.path.replace(/\\/g, '/').replace('attachments/', '/');
        });
        // Find the blog by ID
        const blogAllc = await Blog.findById(blogId);
        const mainComments = blogAllc.comments.slice(0, limit);
        //console.log(mainComments);

        let totalmainCommentsComments = 0;
        mainComments.forEach(comment => {
            totalmainCommentsComments += 1;
            totalmainCommentsComments += comment.principale_comment.replies_comments.length;
        });



        let totalComments = 0;
        blogAllc.comments.forEach(comment => {
            totalComments += 1;
            totalComments += comment.principale_comment.replies_comments.length;
        });

        // Find the next and previous blogs based on their IDs
        const nextBlog = await Blog.findOne({ _id: { $gt: blogId } }).select('title _id').sort({ _id: 1 });
        const prevBlog = await Blog.findOne({ _id: { $lt: blogId } }).select('title _id').sort({ _id: -1 });

        return res.render("blog", { blog: blog, mainComments: mainComments, nextBlog: nextBlog, prevBlog: prevBlog, totalComments: totalComments, limit: limit, totalccm: totalmainCommentsComments, nonce });
    } catch (error) {
        console.error(error);
        //return res.status(500).send('Internal Server Error');
        return res.render("error", { error });
    }
});


router.get('/:id/comments', async (req, res) => {
    const blogId = req.params.id;

    const skip = req.query.skip;
    const limit = req.query.limit;

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        const blogAllc = await Blog.findById(blogId);
        let allComments = 0;
        let NBpcomment = 0;
        blogAllc.comments.forEach(comment => {
            allComments += 1;
            NBpcomment += 1;
            allComments += comment.principale_comment.replies_comments.length;
        });
        let existec = 0;
        if (NBpcomment - parseInt(skip) - parseInt(limit) > 0) {
            existec = allComments - parseInt(skip) - parseInt(limit) - parseInt(skip);
        }
        const comments = blog.comments.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

        //console.log(comments);

        res.json({ comments, TTC: existec });
    } catch (error) {
        console.error(error);
        //res.status(500).json({ error: 'Internal Server Error' });
        return res.render("error", { error });
    }
});















/* 
router.get('/:id/gcomment', async (req, res) => {
    try {
        const blogId = req.params.id;

        // Loop to create three main comments
        for (let i = 1; i < 4; i++) {
            const name = `Jasser Hach${i}`;
            const email = 'hachjasser096@gmail.com';
            const commentText = `when ${i} an unknown printer took a galley of type and scrambled it to make a type specimen book.`;
            const website = `website${i}`;

            // Find the blog by ID
            const blog = await Blog.findById(blogId).exec();

            // Create a new principal comment
            const newPrincipalComment = {
                principale_comment: {
                    name,
                    email,
                    comment: commentText,
                    website,
                    date_comment: Date.now(),
                    receive_news: false
                },
                replies_comments: [] // Initialize replies_comments array
            };

            // Add replies if provided
            for (let j = 1; j < 3; j++) {
                const reply = {
                    name: `Lar${j}`,
                    email: 'jassour7777@gmail.com',
                    comment: `Lorem ${j} Ipsum has been the industry's standard dummy text ever since the 1500s.`,
                    website: `reply site ${j}`,
                    to: name,
                    date_reply: Date.now(),
                    receive_news: false
                };
                newPrincipalComment.replies_comments.push(reply); // Push reply object, not { reply }
            }

            blog.comments.push(newPrincipalComment); // Push newPrincipalComment object, not { newPrincipalComment }

            // Save the updated blog
            await blog.save();
        }

        res.status(200).send('Comments added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
 */

/* router.get('/:id/remove', async (req, res) => {
    try {
        const blogId = req.params.id;

        // Find the blog by ID and update the comments to an empty array
        await Blog.findByIdAndUpdate(blogId, { $set: { comments: [] } }).exec();

        res.status(200).send('All comments removed successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
 */




router.post("/:id/comment", async (req, res) => {
    try {
        const blogId = req.params.id;
        // Find the blog by ID
        const blog = await Blog.findById(blogId).exec();
        const { name, email, comment, website, receive_news } = req.body;
        let errors = [];

        // Check if any required field is missing
        if (!name) {
            errors.push("Name is required");
        }
        if (!email) {
            errors.push("Email is required");
        }
        if (!comment) {
            errors.push("Comment is required");
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors: errors });
        }
        console.log("add comment here");
        console.log(req.body);
        // Create a unique idP for the new principal comment
        let idP;
        let idPExists = true;
        while (idPExists) {
            idP = Date.now() + Math.floor(Math.random() * 1000);
            idPExists = blog.comments.some(comment => comment.principale_comment.idP === idP);
        }

        // Create a new principal comment
        const newPrincipalComment = {
            idP: idP,
            name,
            email,
            comment,
            website,
            receive_news,
            date_comment: new Date(),
            replies_comments: [] // Initialize replies_comments array
        };
        // Add the new principal comment to the blog's comments array
        blog.comments.push({ principale_comment: newPrincipalComment });

        // Save the updated blog
        await blog.save();
        console.log("idP :" + idP);
        // Récupérez l'ID du commentaire principal nouvellement créé
        const pDate = formatDateC(newPrincipalComment.date_comment);
        return res.status(200).json({ message: 'Comment created successfully', idP, pDate });

    } catch (error) {
        console.error(error);
        //return res.redirect("/404");
        //return res.status(500).json({ errors: ['Error creating comment'] });
        return res.render("error", { error });
    }
});

router.post("/:id/Rcomment", async (req, res) => {
    console.log(req.body);
    const blogId = req.params.id;
    const { 'name': name, 'email': email, 'comment': comment, 'website': website, 'receive_news': receive_news, 'data_to': data_to, 'data_idP': data_idP, 'data_toid': data_toid } = req.body;
    let errors = [];

    // Check if any required field is missing
    if (!name) {
        errors.push("Name is required.");
    }
    if (!email) {
        errors.push("Email is required.");
    }
    if (!comment) {
        errors.push("Comment is required.");
    }
    if (!data_to) {
        errors.push("Problem refresh page please.");
    }
    if (!data_idP) {
        errors.push("Problem refresh page please.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ errors: ['Blog not found'] });
        }
        // Assuming data_to contains the ID of the parent comment
        const parentComment = blog.comments.find(comment => comment.principale_comment.idP.toString() === data_idP); //|| comment.principale_comment.replies_comments.some(reply => reply.idR.toString() === data_idP)
        if (!parentComment) {
            return res.status(404).json({ errors: ['Parent comment not found'] });
        }
        let idR;
        let idRExists = true;

        while (idRExists) {
            idR = Date.now() + Math.floor(Math.random() * 1000);
            const existingReply = blog.comments.find(comment => comment.principale_comment.replies_comments.some(reply => reply.idR === idR));
            if (!existingReply) {
                idRExists = false;
            }
        }

        const replyComment = {
            idR: idR,
            name: name,
            email: email,
            comment: comment,
            website: website || '', // Default value in case website is not provided
            date_reply: new Date(),
            receive_news: receive_news === "yes",
            to: data_to,
        };
        parentComment.principale_comment.replies_comments.push(replyComment);
        await blog.save();
        const replycommentelm = parentComment.principale_comment.replies_comments.find(reply => reply.idR.toString() === data_toid);
        console.log(replycommentelm);
        let email_dest = "";
        let name_dest = "";
        if (replycommentelm) {
            email_dest = replycommentelm.email;
            name_dest = replycommentelm.name;
            console.log("replycommentelm" + replycommentelm.receive_news);
        } else {
            console.log("ok");
            email_dest = parentComment.principale_comment.email;
            name_dest = parentComment.principale_comment.name;
        }
        const blogtitle = blog.title;
        const destcomment = parentComment.principale_comment.comment;

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

        const emailvar = { name_dest, name, blogtitle, destcomment, comment, yearText };
        const templatePath = path.join(__dirname, '../Emailmodels/answercomment.ejs');

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
                    to: email_dest,
                    subject: 'Nouvelle réponse à votre commentaire',
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
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ errors: ['Error sending email'] });
            }

        });


        const pDate = formatDateC(replyComment.date_reply);
        return res.status(200).json({ message: 'Comment created successfully', data_idP, pDate, data_to, idR });
    } catch (error) {
        console.error(error);
        //return res.redirect("/404");
        //return res.status(500).json({ errors: ['Error creating comment'] });
        return res.render("error", { error });
    }
});


module.exports = router;
