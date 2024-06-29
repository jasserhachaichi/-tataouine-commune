const express = require("express");
const path = require('path');
const router = express.Router();
const Event = require("./../models/Event");
const fs = require('fs');
router.use(express.static("public"));

router.get("/", async (req, res) => {
  const isUser = req.userRole;
  const nonce = res.locals.nonce;
  try {
    /*    const events = [
          {
            title: 'Boot Camp',
            className: 'text-success',
            start: '2024-04-01T10:00:00.000Z',
            end: '2024-04-03T16:00:00.000Z',
            allDay: true,
            location: 'Boston Harborwalk, Christopher Columbus Park, <br /> Boston, MA 02109, United States',
            description: "Boston Harbor Now in partnership with the Friends of Christopher Columbus Park, the Wharf District Council and the City of Boston is proud to announce the New Year's Eve Midnight Harbor Fireworks! This beloved nearly 40-year old tradition is made possible by the generous support of local waterfront organizations and businesses and the support of the City of Boston and the Office of Mayor Marty Walsh.",
            organizer: 'Boston Harbor Now'
          },
          {
            title: "Crain's New York Business",
            className: 'text-primary',
            start: '2024-04-11T08:00:00.000Z',
            location: '',
            description: "Crain's 2020 Hall of Fame. Sponsored Content By Crain's Content Studio. Crain's Content Studio Presents: New Jersey: Perfect for Business. Crain's Business Forum: Letitia James, New York State Attorney General. Crain's NYC Summit: Examining racial disparities during the pandemic\r\n",
          },
          {
            title: 'Conference',
            className: 'text-success',
            start: '2024-04-21T08:00:00.000Z',
            location: '',
            description: 'The Milken Institute Global Conference gathered the best minds in the world to tackle some of its most stubborn challenges. It was a unique experience in which individuals with the power to enact change connected with experts who are reinventing health, technology, philanthropy, industry, and media.\r\n',
          },
          {
            title: 'Reporting',
            className: 'text-success',
            start: '2024-04-21T11:00:00.000Z',
            location: '',
            description: 'Time to start the conference and will briefly describe all information about the event.',
          },
          {
            title: 'Lunch',
            className: 'text-info',
            start: '2024-04-21T14:00:00.000Z',
            location: '',
            description: 'Lunch facility for all the attendance in the conference.',
          },
          {
            title: 'Contest',
            className: 'text-success',
            start: '2024-04-21T16:00:00.000Z',
            location: '',
            description: 'The starting of the programming contest',
          }
        ];
    
        events.forEach(event => {
          const newEvent = new Event(event);
          newEvent.save()
    
    
    
    
        }); */


    return res.render("dashboard/calendar", { isUser ,nonce});
  } catch (error) {
    // Handle errors
    console.error("Error fetching events:", error);
    //return res.redirect("/404");
    return res.render("error", { error });
  }
});

router.delete("/deleteevents/:id2", async (req, res) => {
  try {
    console.log(req.params.id2);
    const eventId2 = req.params.id2;

    // Find the event by ID
    const event = await Event.findById(eventId2);

    // Check if the event is found
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Remove associated files
    const filesToDelete = [
      ...event.slogospath,
      ...event.ologospath,
      event.coverpath,
      ...event.attachements.map(att => att.path),
    ];

    filesToDelete.forEach(filePath => {
      if (filePath !== "/images/BgEvent-default.jpg") {
        const fullPath = path.join(__dirname, '..', 'attachments', filePath);
        fs.unlink(fullPath, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${fullPath}`, err);
          } else {
            console.log(`File deleted: ${fullPath}`);
          }
        });
      }
    });

    await event.deleteOne(); // Use deleteOne instead of remove

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.render("error", { error });
  }
});

router.get("/events", async (req, res) => {
  try {
    let events = await Event.find().select("_id title className allDay venue country state city description start end organizers sponsors").lean();

    events = events.map(event => {
        const locationComponents = [];
        if (event.venue) locationComponents.push(event.venue);
        if (event.country) locationComponents.push(event.country);
        if (event.state) locationComponents.push(event.state);
        if (event.city) locationComponents.push(event.city);
        event.location = locationComponents.join(', ');
        return event;
    });

    //console.log(events);
    return res.status(200).json({ events });
} catch (error) {
    //return res.status(500).json({ message: "Failed to fetch events", error: error.message });
    return res.render("error", { error });
}
});

/* router.post("/addevents", async (req, res) => {
  try {
    //console.log(req.body);
    const eventData = req.body;

    const newEvent = new Event({
      title: eventData.title,
      className: "text-" + eventData.label,
      start: eventData.startDate,
      end: eventData.endDate,
      allDay: eventData.allDay === 'on',
      location: eventData.location,
      description: eventData.description,
      organizer: eventData.organizer,
      summernote: "No content"
    });
    console.log(newEvent);
    newEvent.save();
  } catch (error) {
    return res.status(500).json({ message: "Failed to save event", error: error.message });
  }
}); */

module.exports = router;
