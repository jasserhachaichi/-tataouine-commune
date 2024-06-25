const express = require("express");
const path = require("path");
const router = express.Router();
const FormData = require('../models/FormData');
const { authorize, uploadFile, appendToSheet, deleteFolder } = require('./../config/googledrive');
const fs = require('fs');
router.use(express.static("public"));

const multer = require('multer');
function getRandomNumber(maxLength) {
    const max = Math.pow(10, maxLength) - 1;
    return Math.floor(Math.random() * max);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'attachments/gdrive/'); // Directory where uploaded files should be stored
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const randomNum = getRandomNumber(7);
        cb(null, file.fieldname + '-' + randomNum + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

function isLoggedIn(req, res, next) {
    //console.log("3 hhhhhhhhh");
    //console.log(req.cookies.visitor);
    if (req.cookies.visitor) {
        next(); // Visitor is logged in
    } else {
        //res.sendStatus(401); // Unauthorized
        res.redirect("/auth/google/form");
    }
}

router.use('/logout', (req, res) => {
    try {
        res.clearCookie('visitor');
        if (req.session && req.session.visitor) {
            req.session.visitor = null;
        }
        return res.redirect("/form");

    } catch (error) {
        return res.render("error", { error });
    }
});

router.get("/", (req, res) => {
    try {
        return res.redirect("/assistances");
    } catch (error) {
        return res.render("error", { error });
    }
});



// Assuming you're rendering an EJS file, pass the data to it
router.get('/:id', isLoggedIn, async (req, res) => {
    const formId = req.params.id;
    const nonce = res.locals.nonce;
    const visitorCookie = req.cookies.visitor;
    try {

        //console.log(visitorCookie);
        const visitor = JSON.parse(decodeURIComponent(visitorCookie));
        res.render('dashboard/form', { formId, visitorName: visitor.name, visitorEmail: visitor.email, nonce });
    } catch (error) {
        // Handle errors
        console.error(error);
        //res.status(500).send('Internal Server Error');
        return res.render("error", { error });
    }
});

router.get('/formdata/:id', isLoggedIn, async (req, res) => {
    const formDataId = req.params.id;

    try {
        const formData = await FormData.findById(formDataId);
        if (!formData) {
            return res.status(404).json({ message: 'Form data not found' });
        }
        //console.log("---------------------feilds");
        return res.status(200).json({ Data: formData.attributes });
    } catch (error) {
        console.error('Error retrieving form data:', error);
        //res.status(500).send('Internal server error');
        return res.render("error", { error });
    }
});



// Route to delete form data by ID
router.get('/delete/:id', async (req, res) => {
    try {
        const formDataId = req.params.id;

        // Find the form data by ID
        const formData = await FormData.findById(formDataId);

        if (!formData) {
            // If form data not found, redirect to 404 page or handle as per your application's logic
            return res.redirect("/404");
        }

        // Delete the form data from MongoDB
        await FormData.findByIdAndDelete(formDataId);

        // Delete the corresponding folder from Google Drive using FormData.FolderID
        const authClient = await authorize();
        await deleteFolder(authClient, formData.FolderID);

        return res.redirect("/assistances");
    } catch (error) {
        console.error('Error deleting form data:', error);
        //return res.redirect("/404"); // Handle error appropriately
        return res.render("error", { error });
    }
});

router.post('/answer/:id', isLoggedIn, upload.any(), async (req, res) => {
    const formDataId = req.params.id;
    const bodyValues = req.body;
    const visitorCookie = req.cookies.visitor;
    try {
        const formData = await FormData.findById(formDataId);

        if (!formData) {
            //return res.status(404).send("Form data not found");
            return res.redirect("/failure");
        }
        // Filter attributes with required === true
        const requiredAttributesNames = formData.attributes
            .filter(attr => attr.required === true)
            .map(attr => attr.name);

        const fileAttributes = formData.attributes
            .filter(attr => attr.type === 'file')
            .map(attr => attr.name);


        const missingRequiredAttribute = requiredAttributesNames.find(name =>
            (name in bodyValues) && bodyValues[name].toString().trim() === ''
        );

        console.log("missingRequiredAttribute : " + missingRequiredAttribute);

        if (missingRequiredAttribute) {
            console.log("jassourrrrr");
            return res.redirect("/failure");
        }
        // Iterate through all uploaded files
        for (let file of req.files) {
            // Check if the uploaded file matches any of the file attribute names
            if (fileAttributes.includes(file.fieldname.replace(/\[\]$/, ''))) {
                //const folderName = formDataId;
                const parents = [formData.FolderID];
                const authClient = await authorize();
                const filePath = file.path; // Path to the uploaded file
                const mimeType = file.mimetype; // MIME type of the uploaded file

                // Upload file to Google Drive
                const fileId = await uploadFile(authClient, file.filename, parents, filePath, mimeType);
                console.log(`File ${file.filename} uploaded to Google Drive with ID: ${fileId}`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }




        const nonNullAttributes = formData.attributes.filter(attr => attr.name !== null);
        const result = nonNullAttributes.map(attr => ({ [attr.name]: "" }));

        // Filling result with values from req.body
        for (let i = 0; i < result.length; i++) {
            const key = Object.keys(result[i])[0];
            if (Object.prototype.hasOwnProperty.call(bodyValues, key)) {
                result[i][key] = bodyValues[key];
            }
        }

        // Normalize field names in req.files and add file paths to result
        for (const file of req.files) {
            const fileKey = file.fieldname.replace(/\[\]$/, ''); // Remove trailing [] if present
            for (let i = 0; i < result.length; i++) {
                const key = Object.keys(result[i])[0];
                if (key === fileKey) {
                    if (Array.isArray(result[i][key])) {
                        result[i][key].push(file.filename);
                    } else if (result[i][key] === "") {
                        result[i][key] = file.filename;
                    } else {
                        result[i][key] = [result[i][key], file.filename];
                    }
                }
            }
        }

        const rowValues = result.map(obj => Object.values(obj)[0]);

        const visitorInfo = JSON.parse(decodeURIComponent(visitorCookie));
        const visitorId = visitorInfo.id;
        const currentDate = new Date();

        rowValues.unshift(visitorId, currentDate.toLocaleString());

        const authClient = await authorize();

        // Append values to the Google Sheet
        await appendToSheet(authClient, formData.SHEETID, rowValues);
        console.log('Data appended to sheet successfully');
        return res.redirect("/success");
    } catch (error) {
        console.error('Error saving form data:', error);
        return res.redirect("/failure");
    }
});



module.exports = router;
