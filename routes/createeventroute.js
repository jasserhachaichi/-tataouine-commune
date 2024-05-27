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

const upload = multer({ storage: storage }).fields([{ name: 'filepond' }, { name: 'filepond2' }, { name: 'filepond3' }, { name: 'filepond4' }]);

router.get('/', (req, res) => {
    res.render("dashboard/createEvent");
})

router.post('/', async (req, res) => {
    upload(req, res, async (err) => {
        //console.log(req.body);
        //console.log(req.files);

        if (err) {
            console.error(err);
            return res.status(500).json({ errors: err });
        }
        const eventData = req.body;

        const title = eventData['event-title'];
        const startDate = eventData['start-date'];

        const errors = [];
        if (!title) errors.push('Title is required');
        if (!req.body.summernote || req.body.summernote == '<p><br></p>') errors.push('Details is required');
        if (!req.body.description) errors.push('Description is required');
        if (!startDate || startDate == '') errors.push('Start date is required');

        const sfilepondFiles = req.files['filepond2'];
        const ofilepondFiles = req.files['filepond'];
        const cfilepondFiles = req.files['filepond3'] ? req.files['filepond3'][0] : null;
        const attachments = req.files['filepond4'];

        if (errors.length > 0) {
            if (ofilepondFiles && ofilepondFiles.length > 0) {
                fs.unlinkSync(ofilepondFiles[0].path);
            }
            if (cfilepondFiles && cfilepondFiles.length > 0) {
                fs.unlinkSync(cfilepondFiles[0].path);
            }
            if (sfilepondFiles && sfilepondFiles.length > 0) {
                fs.unlinkSync(sfilepondFiles[0].path);
            }
            if (attachments && attachments.length > 0) {
                fs.unlinkSync(attachments[0].path);
            }
            return res.status(400).json({ errors: errors });
        }


        try {
            let tags = [];
            let organizers = [];
            let sponsors = [];

            if (eventData['tags-event']) {
                const tagsArray = JSON.parse(eventData['tags-event']);
                tags = tagsArray.map(tag => tag.value);
            }

            if (eventData['organizers']) {
                const organizersarr = JSON.parse(eventData['organizers']);
                organizers = organizersarr.map(tag => tag.value);
            }

            if (eventData['sponsors']) {
                const sponsorsarr = JSON.parse(eventData['sponsors']);
                sponsors = sponsorsarr.map(tag => tag.value);
            }



            var slogospath = [];
            if (sfilepondFiles && sfilepondFiles.length > 0) {
                sfilepondFiles.forEach(file => {
                    slogospath.push(file.path);
                });
            }

            var ologospath = [];
            if (ofilepondFiles && ofilepondFiles.length > 0) {
                ofilepondFiles.forEach(file => {
                    ologospath.push(file.path);
                });
            }


            var formattedAttachments = [];
            if (attachments && attachments.length > 0) {
                formattedAttachments = attachments.map(file => ({
                    filename: file.filename,
                    path: file.path,
                }));
            }
            console.log(formattedAttachments)



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
                organizers: organizers,
                sponsors: sponsors,
                tags: tags,
                summernote: eventData.summernote,
                slogospath: slogospath,
                ologospath: ologospath,
                attachements: formattedAttachments,
                coverpath: cfilepondFiles ? cfilepondFiles.path : "images/BgEvent-default.jpg",
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
                organizers: organizers,
                sponsors: sponsors,
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
