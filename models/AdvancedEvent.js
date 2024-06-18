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
    start: {
        type: Date,
        required: true
    },
    end: Date,
    regDead: Date,
    organizers: [String],
    sponsors: [String],
    tags: [String],
    summernote: {
        type: String,
        required: true
    },
    slogospath:[String],
    ologospath:[String],
    attachements: [
        {
            filename: String,
            path: String
        }
    ],
    coverpath:{
        type:String,
        default: "images/BgEvent-default.jpg",
    },
});

const AdvancedEvent = mongoose.model('AdvancedEvent', AdvancedEventSchema);

module.exports = AdvancedEvent;
