const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    services: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
    }
});

module.exports = mongoose.model("Cart", cartSchema);