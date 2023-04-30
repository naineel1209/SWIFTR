const express = require('express');
const router = express.Router({ mergeParams: true });
const { StatusCodes } = require('http-status-codes');
const User = require('../models//Users');
const Service = require('../models/Services');
const Review = require('../models/Reviews');
const { authorizeUser, checkPermission } = require('../middlewares/isLoggedIn');
const { CustomAPIError, BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');

router
  .route('/')
  //get all services
  .get(async function (req, res) {
    if (req.query.constructor === Object && Object.keys(req.query).length !== 0) {
      const { search, price, limit } = req.query;

      const regexp = new RegExp(search, 'i');
      const filter = {};
      filter.$or = [
        { category: { $regex: regexp } },
        { name: { $regex: regexp } }
      ]
      const services = await Service.find(filter).populate('user').exec();

      return res.status(StatusCodes.OK).send({ services, count: services.length, user: req.user });

    } else {

      const services = await Service.find({}).populate('user').exec();
      console.log("Insideee");
      return res.status(StatusCodes.OK).send({ services, count: services.length, user: req.user });
    }
  })
  .post([authorizeUser('provider', 'admin')], async function (req, res) {
    req.body.user = req.user;

    const service = new Service(req.body);
    await service.save();

    res.status(StatusCodes.CREATED).send({ data: service, user: req.user, redirectUrl: `/services/${service._id}` });
  });

// Strictly a testing route
router.get('/getService', async (req, res) => {
  const id = "644178ea2186e936202131d1";

  const service = await Service.findById(id).populate('reviews');

  console.log(service);
  console.log(service.reviews);
});

// single pages
router
  .route('/:id')
  //get service 
  // TODO - add populate reviews.user fuctionality
  .get(async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id).populate('user').populate('reviews').populate({ path: 'reviews.user' }).exec();

    if (!service) {
      throw new NotFoundError(`No service with id: ${id}`)
    }

    return res.status(StatusCodes.OK).send({ service });
  })
  //edit the service
  .patch([authorizeUser('provider', 'admin')], async (req, res) => {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      throw new NotFoundError(`No service found for ${id}`);
    }

    await checkPermission(req.user, service);

    const finalService = await Service.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(StatusCodes.OK).send({ msg: "Successfully made the changes.", finalService, redirectUrl: `/services/${service._id}` });
  })
  //delete the service -- accessible from myservices page
  .delete([authorizeUser('provider', 'admin')], async (req, res) => {
    const { id } = req.params;
    const service = await Service.findOne({ _id: id });

    if (!service) {
      throw new NotFoundError("No Service found for " + id);
    }

    await checkPermission(req.user, service);

    await Service.deleteOne({ _id: service._id });

    return res.status(StatusCodes.OK).send({ msg: `Successfully removed service - ${service.name}`, redirectUrl: "/my-profile" });
  });

module.exports = router;




