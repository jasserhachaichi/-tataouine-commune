const express = require("express");
const router = express.Router();
const FormData = require('../models/FormData');
router.use(express.static("public"));

router.get('/', async (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    let query = { target: "team" };
    const { search, page } = req.query;
    const perPage = 10; // Number of forms per page
    const pageNumber = parseInt(page) || 1; // Current page number, default to 1

    // If search term is provided, filter by titleForm
    if (search) {
        query = {
            $or: [
                { titleForm: { $regex: search, $options: 'i' } },
                { target: "team" }
            ]
        };
    }

    try {
        const skip = (pageNumber - 1) * perPage;

        const allFormData = await FormData.find(query)
            .skip(skip)
            .limit(perPage) // Limit number of results per page
            .select('titleForm _id FolderID SHEETID target');

        return res.render("dashboard/teamform", {
            formData: allFormData,
            currentPage: pageNumber,
            totalPages: Math.ceil(await FormData.countDocuments(query) / perPage),
            search: search,
            isUser,nonce
        });
    } catch (error) {
        console.error('Error fetching form data:', error);
        return res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
