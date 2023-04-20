const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['cleaning', 'plumbing', 'electrician', 'carpentry', 'gardening', 'painting', 'pest control', 'beauty', 'fitness', 'tutoring', 'photography', 'repair', 'handyman', 'moving', 'massage', 'therapy', 'other'],
        required: true
    },
    image: {
        type: String,
        default: '/uploads/example.jpg',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
}, { timestamps: true });

// Define the Booking schema
const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
}, { timestamps: true });

// Define the Review schema
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    services: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Export the schemas as Mongoose models
module.exports = {
    Service: mongoose.model('Service', serviceSchema),
    Booking: mongoose.model('Booking', bookingSchema),
    Review: mongoose.model('Review', reviewSchema),
}
