const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models//Reviews');
const { StatusCodes } = require('http-status-codes');


// /services/serviceId/reviews/
router
    .route('/')
    .get(async function (req, res) {
        //Get Single Product Reviews
        const reivews = await Service.find({ _id: req.params.serviceId }).populate('reviews');

        return res.status(StatusCodes.OK).send({ reivews });
    });

module.exports = router;