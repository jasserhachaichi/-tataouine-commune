const express = require("express");
const router = express.Router();
const Announcement = require('../models/Announcement');
const fs = require('fs');
const mongoose = require('mongoose');

router.use(express.static("public"));

// GET route for rendering all announcements
router.get("/", async (req, res) => {
    const nonce = res.locals.nonce;
    try {
        let query = {};
        const { search, page, sortOrder, statusFilter } = req.query;
        const perPage = 6; // Number of videos per page
        const pageNumber = parseInt(page) || 1; // Current page number, default to 1

        // If search term is provided, filter by title
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } }, // Case-insensitive search
                ]
            };
        }
        // Filter by expiration status
        const currentDate = new Date();
        if (statusFilter) {
            if (statusFilter === "expired") {
                query = {
                    ...query,
                    expiredDate: { $lt: currentDate }
                };
            } else if (statusFilter === "notExpired") {
                query = {
                    ...query,
                    expiredDate: { $gte: currentDate }
                };
            }
        }

        // Calculate skip value based on current page number
        const skip = (pageNumber - 1) * perPage;
        // Determine sort order
        let sortOption = { createdAt: -1 };
        if (sortOrder === "up") {
            sortOption = { createdAt: 1 }; // Ascending order
        } else if (sortOrder === "down") {
            sortOption = { createdAt: -1 }; // Descending order
        }

        const announcements = await Announcement.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(perPage); // Limit number of results per page

        announcements.forEach(announce => {
            announce.path = announce.path;
        });




        return res.render("allannouncement", {
            announcements: announcements,
            currentPage: pageNumber,
            totalPages: Math.ceil(await Announcement.countDocuments(query) / perPage),
            search: search,
            sortOrder: sortOrder,
            statusFilter: statusFilter, nonce
        });

    } catch (error) {
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});
// GET route for showing Announcement content by ID
router.get("/:id", async (req, res) => {
    const announcementId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(announcementId)) {
        return res.redirect("/404");
    }
    const nonce = res.locals.nonce;
    try {

        // Find the Announcement by ID in the database
        const announcement = await Announcement.findById(announcementId);
        if (!announcement) {
            // If no announcement is found, redirect to a 404 page or handle the error appropriately
            return res.redirect("/404");
        }

        announcement.attachments.forEach(att => {
            att.path = att.path.replace(/\\/g, '/').replace('attachments/', '/');
        });


        // Render the EJS template with the announcement data
        return res.render("announcement", { announcement, nonce });
    } catch (error) {
        console.error(error);
        //return res.redirect("/404");
        return res.render("error", { error });
    }
});




module.exports = router;