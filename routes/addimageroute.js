const express = require('express');
const router = express.Router();
const multer = require('multer'); // Module pour gérer les fichiers
const fs = require('fs');
const Image = require('./../models/Image');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'attachments/IMGuploads/'); // Dossier où les fichiers seront stockés sur le serveur
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


router.get("/", (req, res) => {
    return res.render("dashboard/addimage");
});
router.post('/', upload.array('filepond'), async (req, res) => {
  try {
    // Récupérer les informations sur les fichiers téléchargés
    const files = req.files;

    console.log(files);

    // Enregistrer les informations des fichiers dans MongoDB
    const savedFiles = await Promise.all(files.map(async (file) => {
      const image = new Image({
        filename: file.originalname,
        path: file.path,
      });
      return await image.save();
    }));

    // Répondre avec les informations des fichiers enregistrés
    res.json({ success: "Uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'enregistrement des fichiers.' });
  }
});

module.exports = router;
