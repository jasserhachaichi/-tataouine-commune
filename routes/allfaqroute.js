const express = require("express");
const router = express.Router();
const Faq = require('./../models/FAQ');

router.use(express.static("public"));

router.get('/', async (req, res) => {
    const isUser = req.userRole;
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

        return res.render("dashboard/allfaq", { 
            groupedFaqs,
            search: search, isUser,nonce
         });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        //return res.status(500).send('Internal Server Error');
        return res.render("error", { error });
    }
});


router.get('/addfaq', async (req, res) => {
    const isUser = req.userRole;
    const nonce = res.locals.nonce;
    try {
        return res.render("dashboard/addfaq", {isUser,nonce});
    } catch (error) {
        console.error('Error fetching form data:', error);
        //return res.status(500).send('Internal Server Error');
        return res.render("error", { error });
    }
});

router.post('/addfaq/newq', async (req, res) => {
    try {
        const title = req.body.title;
        const question = req.body.question;
        const answer = req.body.answer;

        //console.log( req.body);

        let errors = [];

        if (!title || title.trim().length === 0) {
            errors.push('Title is required');
        }
        if (!question || question.trim().length === 0) {
            errors.push('Question is required');
        }
        if (!answer || answer.trim().length === 0) {
            errors.push('Answer is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors: errors });
        }

        // Create a new FAQ document
        const newFaq = new Faq({ title, question, answer });

        // Save the document to the database
        await newFaq.save();
        //console.log(newFaq);

        // Send a success response
        return res.status(200).json({ message: 'FAQ added successfully!' });
    } catch (error) {
        console.error('Error saving FAQ:', error);
        //return res.status(500).json({ message: 'Internal Server Error' });
        return res.render("error", { error });
    }
});

router.get('/deletefaq/:id', async (req, res) => {
    try {
        const faqId = req.params.id;
        const faq = await Faq.findById(faqId);

        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        await Faq.findByIdAndDelete(faqId);
        return res.redirect('/allfaq');
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        //return res.status(500).json({ message: 'Internal Server Error' });
        return res.render("error", { error });
    }
});






module.exports = router;
