const express = require('express');
const router = express.Router();
const Order = require('../models/Orders');
const Cart = require('../models/Carts');
router
    .route('/')
    .post(async (req, res) => {
        //getting the req.body from the client which is the result of Cart Model
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || cart.services.length < 1) {
            throw new NotFoundError("No Cart found! with id " + req.user._id);
        }


    })


module.exports = router;