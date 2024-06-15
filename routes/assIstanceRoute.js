const express = require("express");
const router = express.Router();
const FormData = require('./../models/FormData');
router.use(express.static("public"));

router.get('/', async (req, res) => {
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
            .skip(skip)
            .limit(perPage) // Limit number of results per page
            .select('titleForm _id');

        //console.log(allFormData);

        return res.render("dashboard/assistances", {
            formData: allFormData,
            currentPage: pageNumber,
            totalPages: Math.ceil(await FormData.countDocuments(query) / perPage),
            search: search,
        });
    } catch (error) {
        console.error('Error fetching form data:', error);
        return res.status(500).send('Internal Server Error');
    }
});
router.get('/:id', async (req, res) => {
    try {
        const formDataId = req.params.id;
        const formDataExists = await FormData.exists({ _id: formDataId });
        if (!formDataExists) {
            return res.status(404).send('Form Data not found');
        }

        return res.render("dashboard/datashow", { formDataId });
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/sheet/:id', async (req, res) => {
    try {
        const formDataId = req.params.id;
        const formData = await FormData.findById(formDataId);

        if (!formData) {
            return res.status(404).send('Form Data not found');
        }

        const attributes = formData.attributes
            .filter(attr => attr.name !== null)
            .map(attr => ({
                name: attr.name,
                label: attr.label
            }));

        const answers = formData.Answers.map(answer => {
            const fieldsMap = {};
            answer.fields.forEach(field => {
                fieldsMap[field.name] = field.value;
            });
            return {
                visitorId: answer.visitorId,
                fields: fieldsMap,
                submittedAt: answer.submittedAt
            };
        });
        //console.log(attributes);
        //console.log("---------------------------------------");
        //console.log(answers);
        return res.json({ attributes, answers });
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
