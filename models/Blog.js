const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: String,
    coverIMGpath:String,
    autor: {
        fullname: String,
        expertise: String,
        autorIMGpath:String,
        socialmedia: {
            linkedin: String,
            facebook: String,
            twitter: String,
            instagram: String,
            whatsapp: String,
            telegram: String,
        },
    },
    nb_views: {
        type: Number,
        default: 0
    },
    details: {
        type: String,
        required: true
    },
    tags: [String],
    comments: [
        {
            principale_comment: {
                name: {
                    type: String,
                    required: true
                },
                email: {
                    type: String,
                    required: true
                },
                website: String,
                date_comment: {
                    type: Date,
                    default: Date.now
                },
                receive_news: {
                    type: Boolean,
                    default: false
                },
            },
            replies_comments: [
                {
                    name: {
                        type: String,
                        required: true
                    },
                    email: {
                        type: String,
                        required: true
                    },
                    website: String,
                    date_reply: {
                        type: Date,
                        default: Date.now
                    },
                    receive_news: {
                        type: Boolean,
                        default: false
                    },
                },
            ],
        },
    ],
    attachments: [
        {
            filename: String,
            path: String
        }
    ],
}, {
    timestamps: true
});

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
