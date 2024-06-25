const express = require("express");
const router = express.Router();
const FormData = require('./../models/FormData');
const Visitor = require('./../models/Visitor');
const { authorize, createFolder, createSheet } = require('./../config/googledrive');
router.use(express.static("public"));


router.get("/", (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        return res.render("dashboard/createassistance", { isUser, nonce });
    } catch (error) {
        return res.render("error", { error });
    }
});

router.post('/saveFormData', async (req, res) => {
    const title = req.body.title;
    const target = req.body.target || "public";
    let fields;

    // Validate title
    if (!title || title.trim() === "") {
        return res.status(400).send('Title is required');
    }

    // Parse formData
    try {
        fields = JSON.parse(req.body.formData);
        //console.log(fields);
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
        attributes: fields,
        target: target,
    });
    //console.log(newFormData._id);

    try {
        //console.log(newFormData);
        const authClient = await authorize();
        // Create a new folder
        const folderName = newFormData._id;
        const parentFolderId = '1yGGwTWHKT441IhHurrK3PStaa2oh5pO7';

        const newFolderId = await createFolder(authClient, folderName, parentFolderId);
        newFormData.FolderID = newFolderId;
        console.log('Folder created with ID:', newFolderId);

        // Filter attributes with label and name not null
        const validAttributes = newFormData.attributes.filter(attr => attr.name !== null);
        // Extract labels from validAttributes
        var labels = validAttributes.map(attr => attr.label);
        // Replace null values with "Hide Input"
        labels = labels.map(label => label === null ? "Hide Input" : label);
        console.log(labels);
        labels.unshift("VisitorID", "SubmittedAt");

        const sheetId = await createSheet(authClient, newFolderId, newFormData.titleForm, labels);
        console.log(`Sheet created successfully inside the folder, ID: ${sheetId}`);
        newFormData.SHEETID = sheetId;

        // Save the form data to the database
        await newFormData.save();

        return res.status(200).json({ message: 'Form created successfully' });
    } catch (error) {
        console.error('Error saving form data:', error);
        //return res.status(500).send('Internal server error');
        return res.render("error", { error });
    }
});


router.get("/visitors", async (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    let query = {};
    const { search, page } = req.query;
    const perPage = 10; // Number of visitors per page
    const pageNumber = parseInt(page) || 1; // Current page number, default to 1
    try {
        // If search term is provided, filter
        if (search) {
            query = {
                $or: [
                    { googleId: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                ]
            };
        }

        const skip = (pageNumber - 1) * perPage;

        const visitors = await Visitor.find(query)
            .skip(skip)
            .limit(perPage); // Limit number of results per page

        const totalVisitors = await Visitor.countDocuments(query);

        return res.render("dashboard/visitors", {
            visitors: visitors,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalVisitors / perPage),
            search: search, isUser, nonce
        });
    } catch (error) {
        return res.render("error", { error });
    }


});



module.exports = router;
