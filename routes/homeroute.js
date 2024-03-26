const express = require("express");
const router = express.Router();
const followerModel = require('./../models/Follower');


router.get("/", (req, res) => {
    return res.render("home");
});

router.post("/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      const newFollower = new followerModel({ email });
      await newFollower.save();
      console.log(email);
      //res.send("Subscription successful!");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  });

module.exports = router;
