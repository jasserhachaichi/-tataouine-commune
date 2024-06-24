const express = require("express");
const router = express.Router();
router.use(express.static("public"));
const Event = require("./../models/Event");


router.get("/allevents", async (req, res) => {
    //console.log("jasser");
    try {
        const events = await Event.find({}, { __v: 0 });
        return res.status(200).json({ events: events });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
});
router.get('/', (req, res) => {
    const nonce = res.locals.nonce;
    return res.render("events",{nonce});
})
router.get('/:id', async (req, res) => {
    const nonce = res.locals.nonce;
    try {
        const eventId = req.params.id;
        var event = await Event.findById(eventId);

        // Current date
        const now = new Date();

        // Fetch latest events not expired and excluding the one with eventId
        const latestEvents = await Event.find({
            _id: { $ne: eventId },
            $or: [
                { end: { $gte: now } },
                { $and: [{ end: null }, { start: { $gte: now } }] }
            ]
        })
        .sort({ start: 1 }) // Sort by start date ascending
        .limit(2)
        .select("title start end participation venue country state city regDead organizers sponsors");

        //console.log(latestEvents);


         res.render('event', { event:event,latestEvents:latestEvents,nonce});
    } catch (error) {
        console.error(error);
        return res.redirect("/404");
    }
})


module.exports = router;
