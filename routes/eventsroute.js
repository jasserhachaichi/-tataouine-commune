const express = require("express");
const router = express.Router();
router.use(express.static("public"));
const AdvancedEvent = require('./../models/AdvancedEvent');

router.get('/', (req, res) => {
    res.render("events");
})
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        var event = await AdvancedEvent.findById(eventId);

        // Current date
        const now = new Date();

        // Fetch latest events not expired and excluding the one with eventId
        const latestEvents = await AdvancedEvent.find({
            _id: { $ne: eventId },
            $or: [
                { end: { $gte: now } },
                { $and: [{ end: null }, { start: { $gte: now } }] }
            ]
        })
        .sort({ start: 1 }) // Sort by start date ascending
        .limit(2)
        .select("title start end participation venue country state city regDead organizers sponsors");

        console.log(latestEvents)


         res.render('event', { event:event,latestEvents:latestEvents});
    } catch (error) {
        console.error(error);
        return res.redirect("/404");
    }
})


module.exports = router;
