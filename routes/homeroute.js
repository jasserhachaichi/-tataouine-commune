const express = require("express");
const router = express.Router();
const followerModel = require('./../models/Follower');
const Blog = require('./../models/Blog');


router.get("/", async (req, res) => {
            // Fetch the three most recent blog posts
            const recentBlogs = await Blog.find().sort({ createdAt: -1 }).limit(3);
            // Render the home page and pass the recentBlogs to the template
            return res.render("home", { recentBlogs });
});

router.post("/subscribe", async (req, res) => {
  try {
      const { email } = req.body;
      const existingFollower = await followerModel.findOne({ email });

      if (existingFollower) {
        console.log("ee");
          return res.status(400)();

      }
      const newFollower = new followerModel({ email });
      await newFollower.save();
      console.log(email);
      res.send("Subscription successful!");
  } catch (error) {
      res.status(500)("Internal Server Error");
  }
});


module.exports = router;