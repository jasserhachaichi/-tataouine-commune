const express = require("express");
const router = express.Router();
const Termsofuse = require('./../models/Termsofuse');
router.use(express.static("public"));
router.get("/", async (req, res) => {
    const nonce = res.locals.nonce;
    try {
        // Fetch the latest terms of use document
        const terms = await Termsofuse.findOne().sort({ updatedAt: -1 });

        // Render the EJS template with the fetched data
        res.render("termsofuse", {
            terms: terms,nonce
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
