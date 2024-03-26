const express = require('express');
const router = express.Router();
const fs = require('fs'); // Import the file system module
const Image = require('./../models/Image'); // Assuming you have a Mongoose model for images

router.get("/", async (req, res) => {
  try {
    const images = await Image.find(); // Fetch all images from MongoDB
    res.render("dashboard/allimage", { images });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post("/delete-image/:id", async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findByIdAndDelete(imageId); // Delete the image record from MongoDB

    // Remove the image file from the server file system
    fs.unlink(image.path, (err) => {
      if (err) {
        console.error(err);
        return res.redirect("/404"); 
      } else {
        return res.redirect("/allimage"); 
      }
    });
  } catch (error) {
    console.error(error);
    return res.redirect("/404"); 
  }
});

module.exports = router;
