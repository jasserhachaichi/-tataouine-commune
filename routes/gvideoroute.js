const express = require("express");
const router = express.Router();
const Videog = require('../models/Videog');
router.use(express.static("public"));

router.get("/", async (req, res) => {
    try {
        let query = {};
        const { search, page } = req.query;
        const perPage = 9; // Number of videos per page
        const pageNumber = parseInt(page) || 1; // Current page number, default to 1

        // If search term is provided, filter by title and description
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Calculate skip value based on current page number
        const skip = (pageNumber - 1) * perPage;

        // Fetch videos from the database based on the query, sorted by createdAt field
        const videos = await Videog.find(query).sort({ createdAt: -1 }).skip(skip).limit(perPage); // Limit number of results per page
        
        // Render the EJS file and pass the videos data along with pagination information
        return res.render("VIDGgallery", { 
            videos: videos,
            currentPage: pageNumber,
            totalPages: Math.ceil(await Videog.countDocuments(query) / perPage),
            search: search
        });
    } catch (err) {
        res.redirect("/404");
    }
});

module.exports = router;
