const express = require("express");
const router = express.Router();
const FormData = require('./../models/FormData');

router.get('/', async (req, res) => {
    try {
        const allFormData = await FormData.find();
        res.render("dashboard/assistances", { formData: allFormData });
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
