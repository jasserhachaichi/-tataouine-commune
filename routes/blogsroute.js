const express = require("express");
const router = express.Router();
const Blog = require('./../models/Blog');


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

        return res.render("blogs", {
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
router.get('/:id', async (req, res) => {
    const blogId = req.params.id;

    try {
        // Find the blog by ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.redirect("/404");
        }
        return res.render("blog", { blog: blog });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
