const mongoose = require('mongoose');

const TermsofuseSchema = new mongoose.Schema({
    details: {
        type: String,
        required: true,
        default: ""
    }
}, {
    timestamps: true
});

const Termsofuse = mongoose.model('Termsofuse', TermsofuseSchema);

module.exports = Termsofuse;
