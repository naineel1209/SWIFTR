const express = require('express');
const router = express.Router({ mergeParams: true });
const { StatusCodes } = require('http-status-codes');
const User = require('../models//Users');
const Service = require('../models/Services');
const { authorizeUser, checkPermission } = require('../middlewares/isLoggedIn');
const { CustomAPIError, BadRequestError, NotFoundError, UnauthorizedError } = require('../errors');

router
  .route('/')
  //get all services
  .get(async function (req, res) {
    if (req.query) {
      const { search, price, limit } = req.query;

      const regexp = new RegExp(search, 'i');
      const filter = {};
      filter.$or = [
        { category: { $elemMatch: { $regex: regexp } } },
        { name: { $regex: regexp } }
      ]
      const services = await Service.find(filter).populate('user').populate('reviews').populate('reviews.user');

      return res.status(StatusCodes.OK).send({ services, count: services.length, user: req.user });
    } else {
      const services = await Service.find({}).populate('user').populate('reviews');

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
  .get(async (req, res) => {
    const { id } = req.params;
    const service = await Service.findOne({ _id: id }).populate({ path: 'user' }).populate({ path: 'reviews' }).populate('reviews.user');

    if (!service) {
      throw new NotFoundError(`No service with id: ${id}`)
    }

    return res.status(StatusCodes.OK).send({ service });
  })
  //edit the service
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

    return res.status(StatusCodes.OK).send({ msg: "Successfully made the changes.", service, redirectUrl: `/services/${service._id}` });
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




