const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
router.use(express.static("public"));
const fs = require('fs');
const Achievement = require('./../models/Achievement');

function getRandomNumber(maxLength) {
  const max = Math.pow(10, maxLength) - 1;
  return Math.floor(Math.random() * max);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'attachments/Achievement/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const randomNum = getRandomNumber(7);
    cb(null, file.fieldname + '-' + randomNum + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });


router.get("/", async (req, res) => {
  const isUser = req.userRole;
  const nonce = res.locals.nonce;
  try {
    // Fetch achievement data from the database
    const achievement = await Achievement.findOne({});

    // Render the EJS template and pass the achievement data to it
    return res.render("dashboard/achievement", { achievement, isUser, nonce });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Erreur' });
  }
});
router.post('/', upload.array('filepond'), async (req, res) => {
  try {
    const updateData = {
      titrec1: req.body.titrec1,
      valc1: req.body.valc1,
      titrec2: req.body.titrec2,
      valc2: req.body.valc2,
      titrec3: req.body.titrec3,
      valc3: req.body.valc3,
      titrec4: req.body.titrec4,
      valc4: req.body.valc4,
    };

    const image = req.files;

    if (image && image[0].path && image[0].path.length > 0) {
      // Find the existing document
      const existingDoc = await Achievement.findOne({});
      if (existingDoc && existingDoc.path) {
        const ImagePath = path.join(__dirname, '../attachments', existingDoc.path);
        console.log(ImagePath);
        if (fs.existsSync(ImagePath)) {
          fs.unlinkSync(ImagePath);
        }
      }
      // Update the path with the new file
      updateData.path = image[0].path.replace(/\\/g, '/').replace('attachments/', '/');
    }

    const achiev = await Achievement.findOneAndUpdate(
      {}, // Assuming there's only one document to update
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true } // Create the document if it doesn't exist
    );

    //console.log(achiev);

    return res.json({ success: "Uploaded successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Erreur' });
  }
});

module.exports = router;
