const express = require("express");
const path = require("path");
const router = express.Router();
const followerModel = require('./../models/Follower');
const Blog = require('./../models/Blog');
const Image = require('./../models/Image');
const Achievement = require('./../models/Achievement');

router.use(express.static("public"));


const sharp = require('sharp');

router.get("/", async (req, res) => {
  try {
    // Fetch the three most recent blog posts
    const recentBlogs = await Blog.find({}, 'coverIMGpath _id title subtitle autor.fullname autor.expertise autor.autorIMGpath createdAt')
      .sort({ createdAt: -1 })
      .limit(3);
    // Fetch the five most recent images
    const recentImages = await Image.find().sort({ createdAt: -1 }).limit(4);

    //console.log(recentImages);
  


    // Resize each image to 400x400
    const resizedImages = await Promise.all(recentImages.map(async (image) => {
      const absolutePath = path.join(__dirname, '../attachments', image.path);
      const resizedImageBuffer = await sharp(absolutePath)
        .resize(400, 400)
        .toBuffer();
      return {
        ...image.toObject(),
        resizedPath: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`
      };
    }));

    //console.log(resizedImages);
    // Fetch the total count of images
    const totalImagesCount = await Image.countDocuments();

        // Fetch achievement data from the database
        const achievement = await Achievement.findOne({});

    return res.render("home", { recentBlogs, recentImages:recentImages, resizedImages: resizedImages, totalImagesCount,achievement });





  } catch (error) {
    console.error(error);
    return res.redirect("/404");
  }
});


/* router.get("/", async (req, res) => {
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
}); */

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email already exists in the database
    const existingFollower = await followerModel.findOne({ email });

    if (existingFollower) {
      //console.log("Email already exists");
      return res.status(400).send("Email already exists");
    }

    // Create a new follower instance with the email
    const newFollower = new followerModel({ email });

    // Save the new follower to the database
    await newFollower.save();
    console.log(`New subscription: ${email}`);

    // Send a successful subscription response
    res.send({ message: "Subscription successful!" });
  } catch (error) {
    console.error("Error occurred during subscription:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;