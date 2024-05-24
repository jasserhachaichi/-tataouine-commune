const mongoose = require('mongoose');

const AdvancedEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: String,
    participation: String,
    venue: String,
    country: String,
    state: String,
    city: String,
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    regDead: Date,
    organizers: String,
    sponsors: String,
    tags: [String],
    summernote: {
        type: String,
        required: true
    },
    logospath:[String],
});

const AdvancedEvent = mongoose.model('AdvancedEvent', AdvancedEventSchema);

module.exports = AdvancedEvent;
