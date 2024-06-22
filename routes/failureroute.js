const express = require("express");
const router = express.Router();
router.use(express.static("public"));

router.get("/", (req, res) => {
    if (req.cookies.visitor) {
        return res.render("failure");
    } else {
        return res.redirect("/404");
    }
});

module.exports = router;