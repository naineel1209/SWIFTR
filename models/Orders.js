const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = require("./Users");

const singleOrderItem = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    qty: { type: Number, required: true },
    service: {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


const orderSchema = new Schema({
    orderItems: {
        type: [singleOrderItem],
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    convinienceFee: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
    },
    paymentIntentId: {
        type: String
    },
    deliver_date: {
        type: Date,
        default: Date.now() + 48 * 60 * 60 * 1000
    },
    stripeSessionId: {
        type: String,
    }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

orderSchema.virtual("address", {
    ref: "User",
    localField: "user",
    foreignField: "_id",
    justOne: true
}).get(function () {
    return this.user.address + ", " + this.user.city + ", " + this.user.state;
});


module.exports = mongoose.model("Order", orderSchema);