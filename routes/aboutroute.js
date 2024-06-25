const express = require("express");
const router = express.Router();
router.use(express.static("public"));

router.get("/", (req, res) => {
    const nonce = res.locals.nonce;
    try {
        return res.render("about",{nonce});
    } catch (error) {
        //return res.redirect("/404");
        return res.render("error", {error});
    }
});

module.exports = router;