const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdvancedEvent = require('./../models/AdvancedEvent');
const Event = require("./../models/Event");

//const { Console } = require("console");

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'attachments/Event/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);

    }

});

const upload = multer({ storage: storage }).fields([{ name: 'filepond' }]);

router.get('/', (req, res) => {
    res.render("dashboard/createEvent");
})

router.post('/', async (req, res) => {
    upload(req, res, async (err) => {
        //console.log(req.body);
        //console.log(req.files);
        if (err) {
            console.error(err);
            return res.status(500).json({ errors: 'Logos upload failed' });
        }
        const eventData = req.body;

        const title = eventData['event-title'];
        const startDate = eventData['start-date'];


        const errors = [];
        if (!title) errors.push('Title is required');
        if (!req.body.summernote || req.body.summernote == '<p><br></p>') errors.push('Details is required');
        if (!req.body.description) errors.push('Description is required');
        if (!startDate || startDate == '') errors.push('Start date is required');

        const filepondFiles = req.files['filepond'];
        if (errors.length > 0) {
            if (filepondFiles && filepondFiles.length > 0) {
                fs.unlinkSync(filepondFiles[0].path);
            }
            return res.status(400).json({ errors: errors });
        }


        try {
            let tags = [];
            if (eventData['tags-event']) {
                const tagsArray = JSON.parse(eventData['tags-event']);
                tags = tagsArray.map(tag => tag.value);
            }
            const logospath = [];
            if (filepondFiles && filepondFiles.length > 0) {
                filepondFiles.forEach(file => {
                    logospath.push(file.path);
                });
            }



            const newEvent = new AdvancedEvent({
                title: title,
                type: eventData.type,
                participation: eventData.participation,
                venue: eventData.venue,
                country: eventData.country,
                state: eventData.state,
                city: eventData.city,
                description: eventData.description,
                startDate: startDate,
                endDate: eventData['end-date'],
                regDead: eventData['Reg-dead'],
                organizers: eventData.organizers,
                sponsors: eventData.sponsors,
                tags: tags,
                summernote: eventData.summernote,
                logospath: logospath,
            });
            console.log(newEvent);
            await newEvent.save();

            const newEventcalendar = new Event({
                title: title,
                className: "text-success",
                start: startDate,
                end: eventData['end-date'],
                allDay: true,
                location: eventData.venue + " , " + eventData.state + " , " + eventData.city + ", " + eventData.country,
                description: eventData.description,
                organizer: eventData.organizer + ' ,' + eventData.sponsors,
                url: "/events/" + newEvent._id
            });
            newEventcalendar.save();

            return res.status(200).send('Event posted successfully');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Error posting Event');
        }
    });
});



module.exports = router;
