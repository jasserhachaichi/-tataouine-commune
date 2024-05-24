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
router.get('/:id',isLoggedIn , async (req, res) => {
    const formId = req.params.id;
    try {
        res.render('dashboard/form', {formId});
    } catch (err) {
        // Handle errors
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle retrieving form data by id
router.get('/formdata/:id',isLoggedIn , async (req, res) => {
    const formDataId = req.params.id;

    try {
        const formData = await FormData.findById(formDataId);
        if (!formData) {
            return res.status(404).json({ message: 'Form data not found' });
        }
        res.status(200).json(formData);
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

module.exports = router;
