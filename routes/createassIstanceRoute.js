const express = require("express");
const router = express.Router();
const FormData = require('./../models/FormData');

router.get("/", (req, res) => {
    return res.render("dashboard/createassistance");
});




// Route to handle saving form data
/* router.post('/saveFormData', async (req, res) => {
    const  title =   req.body.title;
    if (title  == "" || !title ) {
        res.status(500).send('Title is required');
    }

    const fields  = req.body.formData;
    //console.log(typeof fields);
        console.log(req.body);
    try {
         const newForm = new FormData({ title, fields });
        await newForm.save();
        console.log('Form data saved:', newForm); 
        res.status(200).json({ message: 'Form created successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).send('Internal server error');
    }
}); */
router.post('/saveFormData', async (req, res) => {
    const title = req.body.title;
    let fields;

    // Validate title
    if (!title || title.trim() === "") {
        return res.status(400).send('Title is required');
    }

    // Parse formData
    try {
        fields = JSON.parse(req.body.formData);
    } catch (error) {
        return res.status(400).send('Invalid form data');
    }

    // Validate form data
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
        return res.status(400).send('Form data is required');
    }

    // Create a new form data instance
    const newFormData = new FormData({
        titleForm: title,
        attributes: fields
    });

    try {
        // Save the form data to the database
        await newFormData.save();
        console.log(newFormData);
        res.status(200).json({ message: 'Form created successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).send('Internal server error');
    }
});
module.exports = router;
