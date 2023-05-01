const express = require('express');
const router = express.Router({ mergeParams: true });
const Order = require('../models/Orders');
const User = require('../models/Users');
const Service = require('../models/Services');
const { StatusCodes } = require('http-status-codes');

//router to get my profile
router
    .route('/')
    .get(async function (req, res) {
        let responseObject = {};
        responseObject.user = req.user;

        const order = await Order.find({ user: req.user._id }).populate('orderItems.service').populate('user').populate('address');

        responseObject.orders = order;

        if (req.user.roles === 'provider' || req.user.roles === 'admin') {
            const service = await Service.find({ user: req.user._id }).populate('user').exec();
            responseObject.services = service;
        }
        return res.status(StatusCodes.OK).json(responseObject);
    })

router
    .route('/changePassword')
    .patch(async function (req, res) {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findByUsername(req.user.username).then(async (u) => {
            await u.setPassword(newPassword);
            await u.save();
            return res.status(200).send(u);
        });
    });

module.exports = router;