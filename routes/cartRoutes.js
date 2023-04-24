const express = require('express');
const router = express.Router({ mergeParams: true });
const { StatusCodes } = require('http-status-codes');
const User = require('../models/Users');
const Service = require('../models/Services');
const Cart = require('../models/Carts');
const { NotFoundError } = require('../errors');

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
    })
    .delete(async function (req, res) {
        const { serviceId } = req.body;

        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId, service: serviceId });

        if (!cart) {
            throw new NotFoundError("No cart found with this service");
        }

        if (cart.quantity === 1) {
            await Cart.deleteOne({ _id: cart._id });
        } else {
            cart.quantity = cart.quantity - 1;
            await cart.save();
        }

        return res.status(StatusCodes.OK).send({ msg: "success", data: cart });
    });



module.exports = router;