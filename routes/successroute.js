const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    if (req.cookies.visitor) {
        return res.render("success");
    } else {
        return res.redirect("/404");
    }
});

module.exports = router;