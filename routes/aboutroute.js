const express = require("express");
const router = express.Router();
router.use(express.static("public"));

router.get("/", (req, res) => {
    const nonce = res.locals.nonce;
    try {
        return res.render("about",{nonce});
    } catch (err) {
        res.redirect("/404");
    }
});

module.exports = router;