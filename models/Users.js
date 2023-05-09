// dropped TODO: Add profile photo option for the last

// done TODO: To understand the flow of the application and make  changes in authorizeUser middleware 

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Review = require('./Reviews')
const Service = require('./Services')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter a valid email address"],
        unique: true,
    },
    roles: {
        type: String,
        enum: ["user", "admin", "provider"],
        required: [true, "Please enter a valid role"],
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);