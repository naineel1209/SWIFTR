// require dotenv and connect to mongoose
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/Users');
const Order = require('./models/Orders');

async function start(URI) {
    await mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('Connected to DB'));
}

start(process.env.MONGO_URI).then(async () => {
    const singleOrderItems = [
        {
            name: "Classic Burger",
            price: 9.99,
            image: "https://example.com/burger.jpg",
            qty: 1,
            service: "60a86f7c1e3d8e0017c37f43",
        },
        {
            name: "French Fries",
            price: 4.99,
            image: "https://example.com/fries.jpg",
            qty: 2,
            service: "60a86f7c1e3d8e0017c37f43",
        },
        {
            name: "Vanilla Milkshake",
            price: 6.99,
            image: "https://example.com/milkshake.jpg",
            qty: 1,
            service: "60a86f7c1e3d8e0017c37f43",
        },
    ];

    const order = new Order({ orderItems: singleOrderItems, user: "6442c7cd1fa042b3636c1e40" });
    await order.save();

    // console.log(order);

    const orderUser = await Order.findById(order._id).populate('user').populate({
        path: "address"
    }).exec();
    console.log(orderUser);
});