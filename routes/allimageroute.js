const express = require('express');
const path = require("path");
const router = express.Router();
const fs = require('fs'); // Import the file system module
const Image = require('./../models/Image'); // Assuming you have a Mongoose model for images
const sharp = require('sharp');
router.use(express.static("public"));

router.get("/", async (req, res) => {
  const isUser = req.userRole;
  const nonce = res.locals.nonce;
  try {
    const page = req.query.page;
    const perPage = 10; // Number of images per page
    const pageNumber = parseInt(page) || 1; // Current page number, default to 1
    const totalPages = Math.ceil(await Image.countDocuments() / perPage);
    const skip = (pageNumber - 1) * perPage;

    const images = await Image.find({}, 'path').sort({ createdAt: -1 }).skip(skip).limit(perPage);
    images.forEach(image => {
      image.path = "attachments" + image.path;
    });

    const resizedImages = await Promise.all(images.map(async (image) => {
      const absolutePath = path.join(__dirname, '..', image.path);
      const resizedImageBuffer = await sharp(absolutePath)
        .resize({ width: 400 }) // Resize to desired dimensions
        .toBuffer();
      return {
        ...image.toObject(),
        resizedPath: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`
      };
    }));

    return res.render("dashboard/allimage", { images: resizedImages, currentPage: pageNumber, totalPages, isUser, nonce });
  } catch (error) {
    console.error(error);
    //return res.status(500).send('Internal Server Error');
    return res.render("error", { error });
  }
});

router.post("/delete-image/:id", async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Image.findById(imageId);

    const ImagePath = path.join(__dirname, '../attachments', image.path);
    console.log(ImagePath);
    if (fs.existsSync(ImagePath)) {
      // Remove the image file from the server file system
      fs.unlinkSync(ImagePath);
    }
    await Image.findByIdAndDelete(imageId);
    return res.redirect("/allimage");


  } catch (error) {
    console.error(error);
    //return res.redirect("/404");
    return res.render("error", { error });
  }
});

module.exports = router;
