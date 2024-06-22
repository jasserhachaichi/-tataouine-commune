const express = require("express");
const router = express.Router();
const multer = require("multer");
const Termsofuse = require('./../models/Termsofuse');
router.use(express.static("public"));
// Set up multer for handling multipart/form-data
const upload = multer();

router.get("/", (req, res) => {
    return res.render("dashboard/termsofuse");
});

router.post('/terms', upload.none(), async (req, res) => {
    try {
        const { summernote } = req.body;
        const errors = [];

        //console.log(summernote);

        if (!summernote) {
            errors.push('Details are required');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors: errors });
        }

        // Update the terms of use document
        const updatedTerm = await Termsofuse.findOneAndUpdate(
            {}, // Assuming there's only one document to update
            { details: summernote },
            { new: true, upsert: true, setDefaultsOnInsert: true } // Create the document if it doesn't exist
        );

        // Respond with success message
        return res.status(201).json({ message: "Terms updated successfully", data: updatedTerm });
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
