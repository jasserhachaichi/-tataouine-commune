const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    appel: {
        type: String,
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
    attachments: [
        {
            originalname: String,
            filename: String,
            path: String
        }
    ],
    formSource: {
        type: String,
    },
    formLink: {
        type: String,
    },
}, {
    timestamps: true
});

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

module.exports = Announcement;
