const express = require('express');
const router = express.Router();
const multer = require('multer'); // Module pour gérer les fichiers
const fs = require('fs');
const Image = require('./../models/Image');
const { promisify } = require('util');
const delay = promisify(setTimeout);
const path = require('path');
router.use(express.static("public"));

function getRandomNumber(maxLength) {
  const max = Math.pow(10, maxLength) - 1;
  return Math.floor(Math.random() * max);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'attachments/IMGuploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const randomNum = getRandomNumber(7);
    cb(null, file.fieldname + '-' + randomNum + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage: storage });


router.get("/", (req, res) => {
  const isUser = req.userRole;
  const nonce = res.locals.nonce;
  try {
    return res.render("dashboard/addimage", { isUser, nonce });
  } catch (error) {
    return res.render("error", { error });
  }
});
router.post('/', upload.array('filepond'), async (req, res) => {
  try {
    // Récupérer les informations sur les fichiers téléchargés
    const files = req.files;

    //console.log(files);

    // Enregistrer les informations des fichiers dans MongoDB
    const savedFiles = await Promise.all(files.map(async (file) => {
      const image = new Image({
        filename: file.originalname,
        path: file.path.replace(/\\/g, '/').replace('attachments/', '/'),
      });
      await delay(300);
      console.log(image.path);
      return await image.save();
    }));

    // Répondre avec les informations des fichiers enregistrés
    return res.json({ success: "Uploaded successfully" });
  } catch (error) {
    console.error(error);
    //return res.status(500).json({ success: false, error: 'Erreur lors de l\'enregistrement des fichiers.' });
    return res.render("error", { error });
  }
});

module.exports = router;
