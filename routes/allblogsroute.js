const express = require("express");
const router = express.Router();
const Blog = require('./../models/Blog');
const fs = require('fs');
const path = require('path');

router.use(express.static("public"));
router.use(express.static("Attachments"));
// Define isNewBlog function
function isNewBlog(createdAt) {
    const blogCreationDate = new Date(createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate - blogCreationDate) / (1000 * 60 * 60 * 24));
    const newBlogThresholdDays = 7; // 7 days
    return daysDifference <= newBlogThresholdDays;
}

router.get("/", async (req, res) => {
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

        const blogs = await Blog.find(query)
            .skip(skip)
            .limit(perPage); // Limit number of results per page

        return res.render("dashboard/allblogs", {
            blogs: blogs,
            currentPage: pageNumber,
            totalPages: Math.ceil(await Blog.countDocuments(query) / perPage),
            search: search,
            isNewBlog: isNewBlog
        });
    } catch (err) {
        console.error(err);
        return res.redirect("/404");
    }
});
router.get("/delete/:id", async (req, res) => {
    const blogId = req.params.id.toLowerCase(); // Use lowercase for variable names
    console.log(blogId);

    try {
        // Find the blog by ID
        const blogToDelete = await Blog.findById(blogId);

        // Delete attachments from the server
        blogToDelete.attachments.forEach(attachment => {
            const attachmentPath = path.join(__dirname, '../', attachment.path);
            if (fs.existsSync(attachmentPath)) {
                fs.unlinkSync(attachmentPath);
            }
        });


        if (blogToDelete.coverIMGpath != "images/Default-cover.jpg") {
            // Delete cover image from the server
            const coverImagePath = path.join(__dirname, '../', blogToDelete.coverIMGpath);
            if (fs.existsSync(coverImagePath)) {
                fs.unlinkSync(coverImagePath);
            }
        }

        if (blogToDelete.autor.autorIMGpath != "images/Default-profile.jpg") {

            // Delete author profile image from the server
            const autorImagePath = path.join(__dirname, '../', blogToDelete.autor.autorIMGpath);
            if (fs.existsSync(autorImagePath)) {
                fs.unlinkSync(autorImagePath);
            }
        }




        // Delete blog from the database
        await Blog.findByIdAndDelete(blogId);

        return res.redirect("/allblogs");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});
router.get('/:id', async (req, res) => {
    try {
        const blogId = req.params.id;
        //let query = {};
        var { search, page } = req.query;
        const perPage = 6; 
        var pageNumber = parseInt(page) || 1;

        if (search) {
            query = {
                $or: [
                    { 'comments.principale_comment.name': { $regex: search, $options: 'i' } },
                    { 'comments.principale_comment.comment': { $regex: search, $options: 'i' } },
                    { 'comments.replies_comments.name': { $regex: search, $options: 'i' } },
                    { 'comments.replies_comments.comment': { $regex: search, $options: 'i' } }
                ]
            };
        }

        const blog = await Blog.findById(blogId).select('-attachments -autor -subtitle -coverIMGpath -nb_views -details -tags').exec();
        if (!blog) {
            return res.status(404).send('Blog post not found');
        }

        let filteredComments = blog.comments;
        if (search) {
            filteredComments = blog.comments.filter(commentObj => {
                const comment = commentObj.principale_comment;
                const matchesPrincipal = comment.name.match(new RegExp(search, 'i')) || comment.comment.match(new RegExp(search, 'i'));
                const matchesReplies = comment.replies_comments.some(reply => reply.name.match(new RegExp(search, 'i')) || reply.comment.match(new RegExp(search, 'i')));
                return matchesPrincipal || matchesReplies;
            });
        }

        const totalComments = filteredComments.length;
        const totalPages = Math.ceil(totalComments / perPage);

        if(totalPages < pageNumber){
            pageNumber = 1;
            page = 1;
        }

        const comments = filteredComments.slice((pageNumber - 1) * perPage, pageNumber * perPage);

        return res.render('dashboard/allcomments', {
            blog,
            comments,
            currentPage: pageNumber,
            totalPages,
            search,
            page
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.get('/comments/PC/:blogId/:idP', async (req, res) => {
    try {
        const { blogId, idP } = req.params;
        const { search } = req.query;
        console.log(search);

        // Find the blog by ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).send('Blog post not found');
        }

        // Filter out the principal comment with the given idP
        blog.comments = blog.comments.filter(commentObj => commentObj.principale_comment.idP !== parseInt(idP));

        // Save the updated blog
        await blog.save();

                // Construct the URL with query parameters
                let redirectUrl = `/allblogs/${blogId}`;
                const queryParams = [];
                if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
                if (queryParams.length > 0) {
                    redirectUrl += `?${queryParams.join('&')}`;
                }
                //console.log(redirectUrl);
        
                return res.redirect(redirectUrl);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});












router.get('/comments/RC/:blogId/:idR', async (req, res) => {
    try {
        const { blogId, idR } = req.params;
        const { search, page } = req.query;
        console.log(search);
        console.log(page);

        // Find the blog by ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).send('Blog post not found');
        }

        // Iterate through each principal comment to find and remove the reply
        blog.comments.forEach(commentObj => {
            commentObj.principale_comment.replies_comments = commentObj.principale_comment.replies_comments.filter(reply => reply.idR !== parseInt(idR));
        });

        // Save the updated blog
        await blog.save();

                // Construct the URL with query parameters
                let redirectUrl = `/allblogs/${blogId}`;
                const queryParams = [];
                if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
                if (page) queryParams.push(`page=${encodeURIComponent(page)}`);
                if (queryParams.length > 0) {
                    redirectUrl += `?${queryParams.join('&')}`;
                }
                //console.log(redirectUrl);
        
                return res.redirect(redirectUrl);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }
});



module.exports = router;
