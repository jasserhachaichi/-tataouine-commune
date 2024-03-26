const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    appel: {
        type: String,
        required: true
    },
    expiredDate: {
        type: Date,
        required: true
    },
    path: {
        type: String,
        default: "images/Default-thumbnail.png",
    },
    details: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

module.exports = Announcement;
