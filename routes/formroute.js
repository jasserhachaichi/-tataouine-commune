const express = require("express");
const router = express.Router();
const FormData = require('../models/FormData');
router.use(express.static("public"));

function isLoggedIn(req, res, next) {
    console.log("3 hhhhhhhhh");
    console.log(req.cookies.visitor);
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

// Route to handle retrieving form data by id
/* router.get('/formdata/:id',isLoggedIn , async (req, res) => {
    const formDataId = req.params.id;

    try {
        const formData = await FormData.findById(formDataId);
        if (!formData) {
            return res.status(404).json({ message: 'Form data not found' });
        }
        console.log("---------------------feilds");
        console.log(formData.fields);
        res.status(200).json(formData);
    } catch (error) {
        console.error('Error retrieving form data:', error);
        res.status(500).send('Internal server error');
    }
}); */
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

router.post('/answer/:id', isLoggedIn, async (req, res) => {
    try {
        const formDataId = req.params.id;
        const bodyvalues = req.body;
        const formData = await FormData.findById(formDataId);

        if (!formData) {
            return res.status(404).send("Form data not found");
        }

        const fields = Object.entries(bodyvalues).map(([name, value]) => {
            if (Array.isArray(value)) {
                value = value.join(', ');
            }
            return { name, value };
        });
        const visitorCookie = req.cookies.visitor;
        const visitor = JSON.parse(decodeURIComponent(visitorCookie));
        const visitorId = visitor._id;

        const newAnswer = {
            visitorId: visitorId,
            fields,
        };

        formData.Answers.push(newAnswer);
        await formData.save();

        res.status(200).send("Form data saved successfully");
    } catch (error) {
        console.error('Error saving form data:', error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
