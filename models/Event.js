const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    className: {
        type: String,
    },
    start: {
        type: Date,
    },
    end: {
        type: Date,
    },
    allDay: {
        type: Boolean,
    },
    description: {
        type: String
    },
    location: {
        type: String,
    },
    organizer: {
        type: String,
    },
    url: {
        type: String,
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
