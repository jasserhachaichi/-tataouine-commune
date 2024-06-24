const express = require("express");
const router = express.Router();
const Faq = require('../models/FAQ');

router.use(express.static("public"));

router.get('/', async (req, res) => {
    const nonce = res.locals.nonce;
    let query = {};
    const  search= req.query.search;


    // If search term is provided, filter by titleForm
    if (search) {
        query = {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } },
            ]
        };
    }

    try {
        const faqs = await Faq.find(query)

        const groupedFaqs = faqs.reduce((acc, faq) => {
            if (!acc[faq.title]) {
                acc[faq.title] = [];
            }
            acc[faq.title].push(faq);
            return acc;
        }, {});

        //console.log(groupedFaqs);

        return res.render("faq", { 
            groupedFaqs,
            search: search,nonce
         });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return res.status(500).send('Internal Server Error');
    }
});






module.exports = router;
