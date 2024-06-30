/* const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    lastname: { type: String, required: true },
    firstname: { type: String, required: true },
    position: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('User', userSchema); */

// User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    lastname: { type: String, required: true },
    firstname: { type: String, required: true },
    position: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
}, {
    timestamps: true
});

userSchema.methods.incrementFailedLoginAttempts = function () {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
        this.lockUntil = Date.now() + (15 * 60 * 1000); // Lock for 15 minutes
    }
    return this.save();
};

userSchema.methods.resetFailedLoginAttempts = function () {
    this.failedLoginAttempts = 0;
    this.lockUntil = undefined;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
