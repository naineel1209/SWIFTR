const mongoose = require('mongoose');
const Service = require('./Services');

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

reviewSchema.statics.calculateAverageRating = async function (serviceId) {
    const result = await this.aggregate([
        { $match: { services: serviceId } },
        {
            $group: {
                _id: null,
                avgRating: {
                    $avg: '$rating'
                },
                noOfReviews: {
                    $sum: 1
                }
            },
        },
    ]);

    console.log(result);

    try {
        await this.model("Service").findOneAndUpdate({
            _id: serviceId
        }, {
            avgRating: Math.ceil(result[0]?.avgRating || 0),
            noOfReviews: result[0]?.noOfReviews || 0,
        });
    } catch (e) {
        console.log(e);
    }
}


reviewSchema.post('save', async function () {
    console.log('Inside save')
    await this.constructor.calculateAverageRating(this.services);
})

reviewSchema.post('deleteOne', { document: true }, async function () {
    console.log('Inside remove');
    await this.constructor.calculateAverageRating(this.services);
})

module.exports = mongoose.model("Review", reviewSchema);