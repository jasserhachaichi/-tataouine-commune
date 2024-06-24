const express = require("express");
const router = express.Router();
const Announcement = require('../models/Announcement');
const fs = require('fs');
const path = require('path');

router.use(express.static("public"));

// GET route for rendering all announcements
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

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage); // Limit number of results per page

        return res.render("dashboard/allposts", {
            announcements: announcements,
            currentPage: pageNumber,
            totalPages: Math.ceil(await Announcement.countDocuments(query) / perPage),
            search: search, isUser, nonce
        });
    } catch (err) {
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

        if (announcementToDelete.path != "/images/Default-thumbnail.png") {
            const thimg = path.join(__dirname, '../attachments', announcementToDelete.path);
            if (fs.existsSync(thimg)) {
                //console.log(thimg);
                // Delete Announcement file
                fs.unlinkSync(thimg);
            }
        }




        announcementToDelete.attachments.forEach(attachment => {
            //console.log("attachement:"   + __dirname+'../attachments'+attachment.path );
            const attachmentPath = path.join(__dirname, '../attachments', attachment.path);
            //console.log(fs.existsSync(attachmentPath));
            if (fs.existsSync(attachmentPath)) {
                fs.unlinkSync(attachmentPath);
            }
        });

        // Delete Announcement from the database
         await Announcement.findByIdAndDelete(announcementId);

        return res.redirect("/allposts");
    } catch (err) {
        console.error(err);
        return res.redirect("/404");
    }
});














module.exports = router;