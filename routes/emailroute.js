const express = require('express');
const router = express.Router();
const Email = require('./../models/Email');
const methodOverride = require('method-override');
const fs = require('fs');


// Override POST requests with DELETE method if "_method" is provided in the form
router.use(methodOverride('_method'));

// Backend route for searching emails
router.get('/', async (req, res) => {
    const page = req.query.page || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;

    try {
        let query = {};
        if (req.query.search) {
            query = {
                $or: [
                    { subject: { $regex: req.query.search, $options: 'i' } },
                    { message: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }

        const totalCount = await Email.countDocuments(query); // Count total matching documents

        const emails = await Email.find(query)
            .skip(skip)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();

        const totalPages = Math.ceil(totalCount / perPage);

        res.render("dashboard/inbox", { emails, currentPage: page, perPage, totalCount, totalPages });
    } catch (err) {
        console.error(err);
        return res.redirect("/404");
    }
});

router.delete('/:id', async (req, res) => {
    const emailId = req.params.id;

    try {
        const deletedEmail = await Email.findByIdAndDelete(emailId);
        if (!deletedEmail) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Supprimer les fichiers d'attachement du serveur
        deletedEmail.attachments.forEach(attachment => {
            try {
                fs.unlinkSync(attachment.path);
                //console.log(`Attachment deleted: ${attachment.filename}`);
            } catch (err) {
                console.error(`Error deleting attachment ${attachment.filename}: ${err}`);
            }
        });

        res.redirect("/emailbox");
    } catch (err) {
        console.error(err);
        res.redirect("/emailbox");
    }
});


  

module.exports = router;
