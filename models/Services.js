//  relocate the schemas to particular locations

const mongoose = require('mongoose');
const Review = require('./Reviews');

//Defining the Service Schema
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
        required: true,
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
    avgRating: {
        type: Number,
    },
    noOfReviews: {
        type: Number,
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

serviceSchema.virtual("reviews", {
    ref: "Review",
    localField: '_id',
    foreignField: 'services',
    justOne: false,
})

serviceSchema.post('findOneAndDelete', async function (data, next) {
    const reviews = await Review.deleteMany({ services: data._id });
    console.log(reviews);
    next();
})

// Export the schemas as Mongoose models
module.exports = mongoose.model("Service", serviceSchema);
