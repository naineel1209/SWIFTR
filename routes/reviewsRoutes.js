const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models//Reviews');
const Service = require('../models//Services');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError, UnauthorizedError } = require('../errors');
const { checkPermission } = require('../middlewares/isLoggedIn');

// /reviews
router
    .route('/')
    .get(async function (req, res) {
        //Get all the reviews
        const reviews = await Review.find({}).populate('services');

        return res.status(StatusCodes.OK).send({ reviews, count: reviews.length });
    })
    .post(async function (req, res) {
        const { services } = req.body;
        const userId = req.user._id;


        const service = await Service.findOne({ _id: services });

        if (!service) {
            throw new NotFoundError("No Service found! with id " + serviceId);
        }

        //check if review already submitted
        const previousReviews = await Review.findOne({ services: services, user: userId });

        if (previousReviews) {
            throw new UnauthorizedError("Review already submitted");
        }

        req.body.user = userId;
        const review = new Review(req.body);
        await review.save();
        return res.status(StatusCodes.CREATED).send({ data: review })
    })

router
    .route('/:reviewId')
    .get(async (req, res) => {
        const { id: reviewId } = req.params;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
        }

        res.status(StatusCodes.OK).json({ review });
    })
    .patch(async (req, res) => {
        const { reviewId } = req.params;
        const { rating, review: reviewBody } = req.body;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        await checkPermission(req.user, review);

        review.rating = rating;
        review.review = reviewBody;

        await review.save();
        return res.status(StatusCodes.OK).send({ review });
    })
    .delete(async (req, res) => {
        const { reviewId } = req.params;

        const review = await Review.findOne({ _id: reviewId });

        if (!review) {
            throw new NotFoundError(`Review not found`);
        }

        await checkPermission(req.user, review);

        await review.deleteOne();
        return res.status(StatusCodes.OK).send({ msg: "Review Deleted Successfully!" });
    })

module.exports = router;