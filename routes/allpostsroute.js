const express = require("express");
const router = express.Router();
const Announcement = require('../models/Announcement');
const fs = require('fs');
const path = require('path');

router.use(express.static("public"));
router.use(express.static("Attachments"));

// GET route for rendering all announcements
router.get("/", async (req, res) => {
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

        const announcements = await Announcement.find(query)
            .skip(skip)
            .limit(perPage); // Limit number of results per page
        
        return res.render("dashboard/allposts", { 
            announcements: announcements,
            currentPage: pageNumber,
            totalPages: Math.ceil(await Announcement.countDocuments(query) / perPage),
            search: search
        });
    } catch (err) {
        return res.redirect("/404");
    }
});
// GET route for showing Announcement content by ID
router.get("/:id", async (req, res) => {
    try {
        const announcementId = req.params.id; // Get the announcement ID from the request parameters

        // Find the Announcement by ID in the database
        const announcement = await Announcement.findById(announcementId);

        if (!announcement) {
            // If no announcement is found, redirect to a 404 page or handle the error appropriately
            return res.redirect("/404");
        }

        // Render the EJS template with the announcement data
        return res.render("dashboard/post", { announcement });
    } catch (err) {
        console.error(err);
        return res.redirect("/404");
    }
});




// Route to handle Announcement deletion
router.get("/delete/:id", async (req, res) => {
    const announcementId = req.params.id; // Use lowercase for variable names
    console.log(announcementId);

    try {
        // Find the Announcement by ID
        const announcementToDelete = await Announcement.findById(announcementId);
        // Delete Announcement file
        fs.unlinkSync(path.join(__dirname, '../attachments',announcementToDelete.path));
        
        // Delete Announcement from the database
        await Announcement.findByIdAndDelete(announcementId);

        return res.redirect("/allposts");
    } catch (err) {
        console.error(err);
        return res.redirect("/404");
    }
});














module.exports = router;