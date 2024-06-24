const express = require("express");
const router = express.Router();
const FormData = require('./../models/FormData');
router.use(express.static("public"));


router.get('/', async (req, res) => {
    const nonce = res.locals.nonce;
    let query = {};
    const { search, page } = req.query;
    const perPage = 10; // Number of forms per page
    const pageNumber = parseInt(page) || 1; // Current page number, default to 1

    // If search term is provided, filter by titleForm
    if (search) {
        query = {
            $or: [
                { titleForm: { $regex: search, $options: 'i' } },
            ]
        };
    }
    try {
        const skip = (pageNumber - 1) * perPage;

        const allFormData = await FormData.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage) // Limit number of results per page
            .select('titleForm _id');

        //console.log(allFormData);

        return res.render("forms", {
            formData: allFormData,
            currentPage: pageNumber,
            totalPages: Math.ceil(await FormData.countDocuments(query) / perPage),
            search: search,nonce
        });
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
