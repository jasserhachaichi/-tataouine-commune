const express = require("express");
const router = express.Router();
const FormData = require('../models/FormData');
router.use(express.static("public"));


router.get("/", (req, res) => {
    return res.redirect("/assistances");
});

router.get("/:id", async (req, res) => {

    try {
        const formData = await FormData.findById(req.params.id);
        if (!formData) {
            return res.redirect("/assistances");
        }
        return res.render("dashboard/editassistance", { formId: formData._id });
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get("/savedform/:id", async (req, res) => {

    try {
        const formData = await FormData.findById(req.params.id);
        if (!formData) {
            return res.redirect("/assistances");
        }
        return res.render("dashboard/editassistance", { formData });
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/updateFormData/:id', async (req, res) => {
    const id = req.params.id;

    // Check if ID is provided
    if (!id) {
        return res.status(400).send('Form ID is required');
    }

    const title = req.body.title;

    // Check if title is provided
    if (!title) {
        return res.status(400).send('Title is required');
    }

    const fields = req.body.formData;

    try {
        // Find the existing form data by ID
        const existingForm = await FormData.findById(id);

        // Check if form data with the given ID exists
        if (!existingForm) {
            return res.status(404).send('Form data not found');
        }

        // Update the existing form data
        existingForm.title = title;
        existingForm.fields = fields;

        // Save the updated form data
        await existingForm.save();

        console.log('Form data updated:', existingForm);
        res.status(200).json({ message: 'Form updated successfully' });
    } catch (error) {
        console.error('Error updating form data:', error);
        res.status(500).send('Internal server error');
    }
});


module.exports = router;
