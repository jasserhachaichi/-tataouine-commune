const express = require("express");
const router = express.Router();
router.use(express.static("public"));
const Event = require("./../models/Event");
const mongoose = require('mongoose');


router.get("/allevents", async (req, res) => {
    try {
      let events = await Event.find().select("_id title className allDay venue country state city description start end organizers sponsors").lean();
  
      // Combine location fields into a single string and map to desired format
      events = events.map(event => {
        const locationComponents = [];
        if (event.venue) locationComponents.push(event.venue);
        if (event.country) locationComponents.push(event.country);
        if (event.state) locationComponents.push(event.state);
        if (event.city) locationComponents.push(event.city);
        const location = locationComponents.join(', ');
  
        return {
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.end,
          description: event.description,
          className: event.className,
          location: location,
          organizers: event.organizers,
          sponsors: event.sponsors
        };
      });
  
      //console.log(events);
      return res.status(200).json({ events });
    } catch (error) {
      console.error("Error fetching events:", error);
      return res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
  });
  
router.get('/', (req, res) => {
    const nonce = res.locals.nonce;
    try {
        return res.render("events",{nonce});
    } catch (error) {
        return res.render("error", { error });
    }
})
router.get('/:id', async (req, res) => {
    const nonce = res.locals.nonce;
    const eventId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.redirect("/404");
    }

    try {
        
        var event = await Event.findById(eventId);
        if (!event){
          return res.redirect("/404");
        }

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
        //return res.redirect("/404");
        return res.render("error", { error });
    }
})


module.exports = router;
