const express = require("express");
const router = express.Router();
const FormData = require('./../models/FormData');
const { authorize, createFolder } = require('./../config/googledrive');

router.get("/", (req, res) => {
    return res.render("dashboard/createassistance");
});

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
    //console.log(newFormData._id);

    try {
        //console.log(newFormData);
        const authClient = await authorize();
        // Create a new folder
        const folderName = newFormData._id;
        const parentFolderId = '1yGGwTWHKT441IhHurrK3PStaa2oh5pO7';
        const newFolderId = await createFolder(authClient, folderName, parentFolderId);
        newFormData.FolderID=newFolderId;
        console.log('Folder created with ID:', newFolderId);
        // Save the form data to the database
        await newFormData.save();// update

        res.status(200).json({ message: 'Form created successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).send('Internal server error');
    }
});
module.exports = router;
