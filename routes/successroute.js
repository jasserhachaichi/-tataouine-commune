const express = require("express");
const router = express.Router();
router.use(express.static("public"));
router.get("/", (req, res) => {
    const nonce = res.locals.nonce;
    if (req.cookies.visitor) {
        return res.render("success",{nonce});
    } else {
        return res.redirect("/404");
    }
});

module.exports = router;