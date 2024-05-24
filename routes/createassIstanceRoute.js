const express = require("express");
const router = express.Router();
const FormData = require('./../models/FormData');

router.get("/", (req, res) => {
    return res.render("dashboard/createassistance");
});




// Route to handle saving form data
router.post('/saveFormData', async (req, res) => {
    const  title =   req.body.title;
    if (title  == "" || !title ) {
        res.status(500).send('Title is required');
    }

    const fields  = req.body.formData;
    console.log(typeof fields);
    try {
        const newForm = new FormData({ title, fields });
        await newForm.save();
        console.log('Form data saved:', newForm);
        res.status(200).json({ message: 'Form created successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
