// TODO ignore Booking model

// const mongoose = require('mongoose');

// // Define the Booking schema
// const bookingSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     service: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Service',
//         required: true
//     },
//     date: {
//         type: Date,
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'confirmed', 'cancelled'],
//         default: 'pending'
//     },
// }, { timestamps: true });

// module.exports = mongoose.model("Booking", bookingSchema);
