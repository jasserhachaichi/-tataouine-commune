const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: String,
    tel: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    attachments: [
        {
            filename: String,
            path: String
        }
    ],
    isOpen: {
        type: Boolean,
        default: false
    },
/*     isFavourite: {
        type: Boolean,
        default: false
    } */
}, {
    timestamps: true
});

const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
