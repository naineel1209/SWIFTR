// require dotenv and connect to mongoose
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/Users');
const Order = require('./models/Orders');
const Service = require('./models/Services');
const Cart = require('./models/Carts');

async function start(URI) {
    await mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('Connected to DB'));
}

// start(process.env.MONGO_URI).then(async () => {
//     const singleOrderItems = [
//         {
//             name: "Classic Burger",
//             price: 9.99,
//             image: "https://example.com/burger.jpg",
//             qty: 1,
//             service: "60a86f7c1e3d8e0017c37f43",
//         },
//         {
//             name: "French Fries",
//             price: 4.99,
//             image: "https://example.com/fries.jpg",
//             qty: 2,
//             service: "60a86f7c1e3d8e0017c37f43",
//         },
//         {
//             name: "Vanilla Milkshake",
//             price: 6.99,
//             image: "https://example.com/milkshake.jpg",
//             qty: 1,
//             service: "60a86f7c1e3d8e0017c37f43",
//         },
//     ];

//     const order = new Order({ orderItems: singleOrderItems, user: "6442c7cd1fa042b3636c1e40" });
//     await order.save();

//     // console.log(order);

//     const orderUser = await Order.findById(order._id).populate('user ').populate({
//         path: "address"
//     }).exec();
//     console.log(orderUser);
// });

async function cartFilling() {
    // const carts = [
    //     {
    //         user: '6442c7cd1fa042b3636c1e40',
    //         services: '644169700ca8cbc76ead8d61',
    //         quantity: 2
    //     },
    //     {
    //         user: '6442c7cd1fa042b3636c1e40',
    //         services: '6442c495f1ec199228cfaac3',
    //         quantity: 1
    //     },
    //     {
    //         user: '6442c7cd1fa042b3636c1e40',
    //         services: '6442c493f1ec199228cfaac0',
    //         quantity: 4
    //     },
    //     {
    //         user: '6442c7cd1fa042b3636c1e40',
    //         services: '64427e10f57916672c9986e8',
    //         quantity: 3
    //     },
    //     {
    //         user: '6442c7cd1fa042b3636c1e40',
    //         services: '644178ea2186e936202131d1',
    //         quantity: 2
    //     }
    // ]

    // await Cart.deleteMany({});

    // for (let cart of carts) {
    //     const newCart = new Cart(cart);
    //     await newCart.save();
    // }

    // const cartItems = await Cart.find({});
    // console.log(cartItems);
}

async function orderDeleteing() {
    await Order.deleteMany({});
}

start(process.env.MONGO_URI).then(async () => {
    // await cartFilling();
    await orderDeleteing().then(() => console.log('done'));

    // let services = await Service.find({});
    // services = services.map(service => service._id);
    // console.log(services);
});
