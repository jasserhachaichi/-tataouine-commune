const express = require("express");
const router = express.Router();
const Videog = require('../models/Videog');
router.use(express.static("public"));
const fs = require('fs');
const path = require('path');

router.get("/", async (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        let query = {};
        const { search, page } = req.query;
        const perPage = 6; // Number of videos per page
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
        const videos = await Videog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage); // Limit number of results per page

        // Render the EJS file and pass the videos data along with pagination information
        return res.render("dashboard/allvideos", {
            videos: videos,
            currentPage: pageNumber,
            totalPages: Math.ceil(await Videog.countDocuments(query) / perPage),
            search: search, isUser, nonce
        });
    } catch (error) {
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});



// Route to handle video deletion
router.get("/delete/:id", async (req, res) => {
    const videoId = req.params.id;
    console.log(videoId);

    try {
        // Find the video by ID
        const video = await Videog.findById(videoId);

        // If video type is "local", delete associated files
        if (video.type === "local") {
            console.log("local");
            const urlvid = path.join(__dirname, '../attachments', video.url);
            if (fs.existsSync(urlvid)) {
                // Delete video file
                fs.unlinkSync(urlvid);
            }
        }
        // Delete thumbnail file if not default
        if (video.thumbnail !== '/images/Default-thumbnail.png') {
            console.log("jasser yt");
            const thimg = path.join(__dirname, '../attachments', video.thumbnail);
            if (fs.existsSync(thimg)) {
                fs.unlinkSync(thimg);
            }
        }
        // Delete video from the database
        await Videog.findByIdAndDelete(videoId);

        return res.redirect("/allvideos");
    } catch (error) {
        console.error(error);
        //return res.status(500).json({ message: "Internal server error" });
        return res.render("error", { error });
    }
});







module.exports = router;
