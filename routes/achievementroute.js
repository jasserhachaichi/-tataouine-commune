const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
router.use(express.static("public"));
const fs = require('fs');
const Achievement = require('./../models/Achievement');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'attachments/Achievement/');
  },
  filename: function (req, file, cb) {
    //cb(null, file.originalname);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });


router.get("/", async (req, res) => {
  const isUser = req.user.userRole;
  try {
    // Fetch achievement data from the database
    const achievement = await Achievement.findOne({});

    // Render the EJS template and pass the achievement data to it
    return res.render("dashboard/achievement", { achievement, isUser });
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
        //console.log("attachments" + existingDoc.path);
        // Remove the existing file
        fs.unlink("attachments" + existingDoc.path, (err) => {
          if (err) {
            console.error(`Failed to delete old file: ${err.message}`);
          } else {
            console.log(`Old file ${existingDoc.path} deleted`);
          }
        });
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
