const express = require("express");
const router = express.Router();
const User = require('../models/User');

router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        return res.render("dashboard/users", { users });
        
    } catch (error) {
        res.redirect("/404");
    }
});


router.get("/delete/:userId", async (req, res) => {
    try {
        //const user = await User.findById(req.params.userId);
        await User.deleteOne({ _id: req.params.userId });

        return res.redirect("/users");
    } catch (error) {
        //console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
