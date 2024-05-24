const express = require("express");
const router = express.Router();
router.use(express.static("public"));
const AdvancedEvent = require('./../models/AdvancedEvent');
router.use(express.static("Attachments"));
router.get('/', (req, res) => {
    res.render("events");
})
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await AdvancedEvent.findById(eventId);

/* : { $gte: new Date() } */
        const latestEvents = await AdvancedEvent.find()
        .sort({ startDate: 1 }) // Sort by start date ascending
        .limit(2); 


         res.render('event', { event:event,latestEvents:latestEvents});
    } catch (error) {
        console.error(error);
        return res.redirect("/404");
    }
})


module.exports = router;
