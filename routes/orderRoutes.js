const express = require('express');
const router = express.Router({ mergeParams: true });
const Order = require('../models/Orders');
const Cart = require('../models/Carts');
const Service = require('../models/Services');
const { NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { checkPermission } = require('../middlewares/isLoggedIn');

const convinienceFeePercentage = 0.05;

const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someRandomValue';
    return { client_secret, amount };
};

router
    .route('/placeOrder')
    .post(async (req, res) => {
        //getting the req.body from the client which is the result of Cart Model
        const cart = await Cart.find({ user: req.user._id });

        if (!cart || cart.length < 1) {
            throw new NotFoundError("No Cart found! with id " + req.user._id);
        }

        let subtotal = 0;
        let orderItems = [];

        for (let item of cart) {
            const service = await Service.findOne({ _id: item.services });

            if (!service) {
                throw new NotFoundError("No service found with id " + item.services);
            }
            const { name, image, price, _id } = service;

            orderItems = [...orderItems, { name, image, price, service: service._id, qty: item.quantity }]

            subtotal += price * item.quantity;
        }

        let convinienceFee = Number(subtotal * convinienceFeePercentage) + 1;
        const total = Number(subtotal + convinienceFee);

        const paymentIntent = await fakeStripeAPI({ amount: total, currency: 'inr' });

        const order = new Order({
            orderItems,
            total,
            subtotal,
            convinienceFee,
            clientSecret: paymentIntent.client_secret,
            user: req.user._id,
        });

        await order.save();

        await Cart.deleteMany({ user: req.user._id });
        return res.status(StatusCodes.CREATED).send({ order, clientSecret: order.clientSecret })
    })

router
    .route('/:id')
    .get(async function (req, res) {
        const { id } = req.params;

        const order = await Order.findOne({ _id: id }).populate('orderItems.service').populate('user').populate('address');

        if (!order) {
            throw new NotFoundError("No Order found with id " + id);
        }

        checkPermission(req.user, order);
        return res.status(StatusCodes.OK).send({ order });
    })
    .patch(async function (req, res) {
        const { id } = req.params;
        const { paymentIntentId } = req.body;

        const order = await Order.findOne({ _id: id });
        order.paymentIntentId = paymentIntentId;
        order.status = "confirmed";

        return res.send(StatusCodes.OK).send({ order });
    });

router
    .route('/getOrders')
    .get(async function (req, res) {
        //Get All Orders for current user
        const orders = await Order.find({ user: req.user._id }).populate('orderItems.service').populate('user').populate('address');
        console.log(orders);
        return res.status(StatusCodes.OK).send({ orders });
    })



module.exports = router;