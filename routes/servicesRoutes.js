const express = require('express');
const router = express.Router();
const { StatusCodes } = require('http-status-codes');
const User = require('../models//Users');
const Service = require('../models/Services');
const { authorizeUser, checkPermission } = require('../middlewares/isLoggedIn');
const { CustomAPIError, BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');

router
  .route('/')
  .get(async function (req, res) {
    const services = await Service.find({}).populate('reviews');

    return res.status(StatusCodes.OK).send({ services, count: services.length, user: req.user });
  })
  .post([authorizeUser('provider', 'admin')], async function (req, res) {
    req.body.user = req.user;

    const service = new Service(req.body);
    await service.save();

    res.status(StatusCodes.CREATED).send({ data: service, user: req.user });
  });

router.get('/getService', async (req, res) => {
  const id = "644178ea2186e936202131d1";

  const service = await Service.findById(id).populate('reviews');

  console.log(service);
  console.log(service.reviews);
});

router
  .route('/:id')
  .get(async (req, res) => {
    const { id } = req.params;
    const service = await Service.findOne({ _id: id }).populate({
      path: 'user'
    }).populate({ path: 'reviews' });

    if (!service) {
      throw new NotFoundError(`No service with id: ${id}`)
    }

    return res.status(StatusCodes.OK).send({ service });
  })
  .patch([authorizeUser('provider', 'admin')], async (req, res) => {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'user',
    }).populate('reviews');;

    if (!service) {
      throw new NotFoundError(`No service found for ${id}`);
    }

    return res.status(StatusCodes.OK).send({ msg: "Successfully made the changes.", service });
  })
  .delete([authorizeUser('provider', 'admin')], async (req, res) => {
    const { id } = req.params;
    const service = await Service.findOne({ _id: id });

    if (!service) {
      throw new NotFoundError("No Service found for " + id);
    }

    checkPermission(req.user, service);

    return res.status(StatusCodes.OK).send({ msg: `Successfully removed service - ${service.name}`, redirectUrl: "/my-profile" });
  });





