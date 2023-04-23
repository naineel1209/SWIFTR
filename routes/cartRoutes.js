const express = require('express');
const router = express.Router({ mergeParams: true });
const { StatusCodes } = require('http-status-codes');
const User = require('../models/Users');
const Service = require('../models/Services');
const Cart = require('../models/Carts');

router
    .route('/addToCart')
    .post(async function (req, res) {
        const { serviceId } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId, service: serviceId });

        if (cart) {
            cart.quantity = cart.quantity + 1;
            await cart.save();
            return res.status(StatusCodes.OK).send({ data: cart });
        } else {
            const cart = new Cart({ user: userId, service: serviceId, quantity: 1 });
            await cart.save();
            return res.status(StatusCodes.CREATED).send({ data: cart });
        }
    });

router
    .route('/getCart')
    .get(async (req, res) => {
        const userId = req.user._id;

        const cart = await Cart.find({ user: userId }).populate('service');

        return res.status(StatusCodes.OK).send({ data: cart });
    })

module.exports = router;