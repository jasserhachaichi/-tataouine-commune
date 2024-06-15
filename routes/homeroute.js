const express = require("express");
const router = express.Router();
const followerModel = require('./../models/Follower');
const Blog = require('./../models/Blog');
const Image = require('./../models/Image');
router.use(express.static("public"));
router.use(express.static("views"));
router.use(express.static("Attachments"));

const sharp = require('sharp');


router.get("/", async (req, res) => {
  try {
    // Fetch the three most recent blog posts
    const recentBlogs = await Blog.find({}, 'coverIMGpath _id title subtitle autor.fullname autor.expertise autor.autorIMGpath createdAt')
      .sort({ createdAt: -1 })
      .limit(3);
    // Fetch the five most recent images
    const recentImages = await Image.find().sort({ createdAt: -1 }).limit(4);
    // Resize each image to 400x400
    const resizedImages = await Promise.all(recentImages.map(async (image) => {
      const resizedImageBuffer = await sharp(image.path)
        .resize(400, 400)
        .toBuffer();
      return {
        ...image.toObject(),
        resizedPath: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`
      };
    }));
        // Fetch the total count of images
        const totalImagesCount = await Image.countDocuments();

    const updatedImages = recentImages.map(image => ({
      ...image.toObject(),
      path: image.path.replace("attachments\\", "").replace(/\\/g, '/')
    }));
    return res.render("home", { recentBlogs, recentImages: updatedImages, resizedImages: resizedImages, totalImagesCount });
  } catch (error) {
    console.error(error);
    return res.redirect("/404");
  }
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