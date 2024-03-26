const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    ltd: {
        type: String,
    },
    link: {
        type: String,
    },
    location: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    },

});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
