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
        required: true
    },
    end: {
        type: Date,
    },
    allDay: {
        type: Boolean,
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    organizers: [String],
    sponsors: [String],
    url: {
        type: String,
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
