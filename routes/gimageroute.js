const express = require('express');
const router = express.Router();
const Image = require('./../models/Image');

router.get("/", async (req, res) => {
  try {
    // Récupérer les images par lots de 20 à partir d'un index (skip)
    const skip = parseInt(req.query.skip) || 0; // Récupérer l'index à partir de l'URL, sinon 0 par défaut
    const limit = 100; // Limite d'images par lot
    const images = await Image.find().skip(skip).limit(limit);

    // Rendre le template EJS et passer les données des images
    res.render("IMGgallery", { images, skip: skip + limit }); // Passer le prochain index dans la variable 'skip'
  } catch (error) {
    console.error(error);
    //res.status(500).send('Erreur lors de la récupération des images depuis MongoDB');
    return res.redirect("/404");
  }
});

module.exports = router;





