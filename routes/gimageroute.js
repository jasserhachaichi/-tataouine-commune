const express = require('express');
const router = express.Router();
const Image = require('./../models/Image');
const sharp = require('sharp');

router.get("/", async (req, res) => {
  try {
    const page = req.query.page;
    const perPage = 20; // Number of images per page
    const pageNumber = parseInt(page) || 1; // Current page number, default to 1
    const totalPages = Math.ceil(await Image.countDocuments()/perPage);
    const skip = (pageNumber - 1) * perPage;

    const images = await Image.find({}, 'path').sort({ createdAt: -1 }).skip(skip).limit(perPage);

    const resizedImages = await Promise.all(images.map(async (image) => {
      const resizedImageBuffer = await sharp(image.path)
        .resize({ width: 400 }) // Resize to desired dimensions
        .toBuffer();
      return {
        ...image.toObject(),
        resizedPath: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`
      };
    }));


    return res.render("IMGgallery", { images: resizedImages, currentPage: pageNumber, totalPages });
  } catch (error) {
    console.error(error);
    return res.redirect("/404");
  }
});




module.exports = router;