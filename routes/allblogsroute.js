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



module.exports = router;
