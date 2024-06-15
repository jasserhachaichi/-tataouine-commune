const express = require("express");
const router = express.Router();
const FormData = require('../models/FormData');
const { authorize, uploadFile } = require('./../config/googledrive');
const fs = require('fs');
router.use(express.static("public"));
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'attachments/gdrive/'); // Directory where uploaded files should be stored
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // File naming convention
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



router.get("/", (req, res) => {
    return res.redirect("/assistances");
});



// Assuming you're rendering an EJS file, pass the data to it
router.get('/:id', isLoggedIn, async (req, res) => {
    const formId = req.params.id;
    try {
        res.render('dashboard/form', { formId });
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/formdata/:id', isLoggedIn, async (req, res) => {
    const formDataId = req.params.id;

    try {
        const formData = await FormData.findById(formDataId);
        if (!formData) {
            return res.status(404).json({ message: 'Form data not found' });
        }
        console.log("---------------------feilds");
        res.status(200).json({ Data: formData.attributes });
    } catch (error) {
        console.error('Error retrieving form data:', error);
        res.status(500).send('Internal server error');
    }
});



router.get('/delete/:id', async (req, res) => {
    try {
        await FormData.findByIdAndDelete(req.params.id);
        return res.redirect("/assistances");
    } catch (error) {
        console.error('Error deleting form data:', error);
        return res.redirect("/404");
    }
});

router.post('/answer/:id', isLoggedIn, upload.any(), async (req, res) => {
    try {
        const formDataId = req.params.id;
        const bodyvalues = req.body;
        console.log(req.body);
        console.log(req.files);
        const formData = await FormData.findById(formDataId);

        if (!formData) {
            return res.status(404).send("Form data not found");
        }
        // Filter attributes with required === true
        const requiredAttributesNames = formData.attributes
            .filter(attr => attr.required === true)
            .map(attr => attr.name);

         const fileAttributes = formData.attributes
            .filter(attr => attr.type === 'file')
            .map(attr => attr.name);
/*
        const namefileAttribute = Object.keys(bodyvalues).find(name => fileAttributes.includes(name)); */
        //console.log(namefileAttribute);




        // Iterate through all uploaded files
         for (let file of req.files) {
            // Check if the uploaded file matches any of the file attribute names
            if (fileAttributes.includes(file.fieldname)) {
                //const folderName = formDataId;
                const parents = [formData.FolderID];
                const authClient = await authorize();
                const filePath = file.path; // Path to the uploaded file
                const mimeType = file.mimetype; // MIME type of the uploaded file

                // Upload file to Google Drive
                const fileId = await uploadFile(authClient, file.originalname, parents, filePath, mimeType);
                console.log(`File ${file.originalname} uploaded to Google Drive with ID: ${fileId}`);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        // Do something with requiredAttributesNames
        //console.log('Names of attributes with required === true:', requiredAttributesNames);

        const missingRequiredAttribute = requiredAttributesNames.find(name =>
            (name in bodyvalues) && bodyvalues[name].toString().trim() === ''
          );
          
        console.log("missingRequiredAttribute : " +  missingRequiredAttribute);

        if (missingRequiredAttribute) {
            console.log("jassourrrrr");
            return res.redirect("/failure");
        }

        const fields = Object.entries(bodyvalues).map(([name, value]) => {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    value = value.join(', ');
                }
            }
            return { name, value };
        });

        const visitorCookie = req.cookies.visitor;
        const visitor = JSON.parse(decodeURIComponent(visitorCookie));
        const visitorId = visitor._id;
        console.log("------------- jzss");

        const newAnswer = {
            visitorId: visitorId,
            fields,
        };

        formData.Answers.push(newAnswer);
        await formData.save();
        //res.status(200).send("Form data saved successfully");
        return res.redirect("/success");
    } catch (error) {
        console.error('Error saving form data:', error);
        /*  res.status(500).send("Internal Server Error"); */
        return res.redirect("/failure");
    }
});

module.exports = router;
