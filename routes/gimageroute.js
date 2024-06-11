const express = require('express');
const router = express.Router();
const Image = require('./../models/Image');
const sharp = require('sharp');

router.get("/", async (req, res) => {
  try {
    const limit = 12;
    const images = await Image.find({}, 'path').sort({ createdAt: -1 }).limit(limit);
    const totalImages = await Image.countDocuments();

    const resizedImages = await Promise.all(images.map(async (image) => {
      const resizedImageBuffer = await sharp(image.path)
        .resize({ width: 400 }) // Resize to desired dimensions
        .toBuffer();
      return {
        ...image.toObject(),
        resizedPath: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`
      };
    }));

    res.render("IMGgallery", { images: resizedImages, limit, totalImages });
  } catch (error) {
    console.error(error);
    return res.redirect("/404");
  }
});

/* router.get("/images/:page", async (req, res) => {
  try {
    const limit = 12;
    const page = parseInt(req.params.page) || 1;
    const offset = (page - 1) * limit;
    const totalImages = await Image.countDocuments();
    let isEnd = false;
    if ((totalImages / limit) < (page - 1)) {
      isEnd = true;
    }


    const images = await Image.find().sort({ createdAt: -1 }).skip(offset).limit(limit);
    const resizedImages = await Promise.all(images.map(async (image) => {
      const resizedImageBuffer = await sharp(image.path)
        .resize({ width: 400 })
        .toBuffer();
      return {
        ...image.toObject(),
        resizedPath: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`
      };
    }));

    res.json(resizedImages,images,isEnd);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
}); */
router.get("/images/:page", async (req, res) => {
  try {
    const limit = 12;
    const page = parseInt(req.params.page) || 1;
    const offset = (page - 1) * limit;
    const totalImages = await Image.countDocuments();

    let isEnd = false;
    if (totalImages <= offset + limit) {
      isEnd = true;
    }

    const images = await Image.find({}, 'path')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const resizedImages = await Promise.all(images.map(async (image) => {
      const resizedImageBuffer = await sharp(image.path)
        .resize({ width: 400 })
        .toBuffer();
      return {
        ...image.toObject(),
        resizedPath: `data:image/jpeg;base64,${resizedImageBuffer.toString('base64')}`
      };
    }));

    res.json({resizedImages: resizedImages, isEnd: isEnd });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



module.exports = router;