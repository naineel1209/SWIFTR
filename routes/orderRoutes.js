require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SERVER_KEY);
const express = require('express');
const router = express.Router({ mergeParams: true });
const Order = require('../models/Orders');
const Cart = require('../models/Carts');
const Service = require('../models/Services');
const { NotFoundError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { checkPermission } = require('../middlewares/isLoggedIn');

const convinienceFeePercentage = 0.05;


router
    .post('/checkout', async (req, res) => {
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

        const line_items = orderItems.map(item => {
            return {
                price_data: {
                    currency: 'inr',
                    unit_amount: item.price * 100,
                    product_data: {
                        name: item.name,
                        metadata: {
                            serviceId: item.serviceId,
                            userId: req.user._id,
                        }
                    },
                },
                quantity: item.qty,
            }
        });

        const customer = await stripe.customers.create({
            metadata: {
                userId: JSON.stringify(req.user._id),
                order: JSON.stringify({ orderItems, total, subtotal, convinienceFee, user: req.user._id }),
            },
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            shipping_address_collection: {
                allowed_countries: ["US", "CA", "KE", "IN"],
            },
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: "fixed_amount",
                        fixed_amount: {
                            amount: convinienceFee * 100,
                            currency: "inr",
                        },
                        display_name: "Free shipping",
                        // Delivers between 1-2 business days
                        delivery_estimate: {
                            minimum: {
                                unit: "business_day",
                                value: 1,
                            },
                            maximum: {
                                unit: "business_day",
                                value: 2,
                            },
                        },
                    },
                }
            ],
            phone_number_collection: {
                enabled: true,
            },
            line_items,
            mode: "payment",
            customer: customer.id,
            success_url: `${process.env.BASE_URL}/success`,
            cancel_url: `${process.env.BASE_URL}/cancel`,
        });

        return res.status(StatusCodes.OK).json({ session, redirectUrl: '/my-profile' })
    });


// This is your Stripe CLI webhook secret for testing your endpoint locally. 
async function createOrder(customer, checkoutSession) {
    const Items = JSON.parse(customer.metadata.order);
    const userId = JSON.parse(customer.metadata.userId);
    Items.user = userId;
    Items.stripeSessionId = checkoutSession.id;
    Items.status = 'confirmed';
    const order = new Order(Items);
    await order.save();

    console.log('Order created');
    console.log(order);

    //TODO : add the delete cart functionality after order is created
    await Cart.deleteMany({ user: userId });
}

const endpointSecret = process.env.ENDPOINT_SECRET;
router.post('/webhook', (request, response) => {
    const sig = request.headers['stripe-signature'];

    //rawBody is a buffer and parsed in the app.js file under express.json() middleware
    let event;

    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
    } catch (err) {
        console.log(err.message);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const checkoutSession = event.data.object;
            stripe.customers
                .retrieve(checkoutSession.customer)
                .then(async customer => {
                    try {
                        createOrder(customer, checkoutSession);
                    } catch (e) {
                        console.log(e);
                    }
                });
            // Then define and call a function to handle the event payment_intent.succeeded

            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});

// get the orders of the current user
router
    .route('/getOrders')
    .get(async function (req, res) {
        //Get All Orders for current user
        const orders = await Order.find({ user: req.user._id }).populate('orderItems.service').populate('user').populate('address');
        console.log(orders);
        return res.status(StatusCodes.OK).send({ orders });
    });

// get the providers order 
router
    .route('/getProviderOrders')
    .get(async function (req, res) {
        if (req.user.roles !== 'provider') {
            throw new UnauthorizedError("You are not authorized to access this route");
        }

        const service = await Service.find({ user: req.user._id }).select('_id');
        console.log("Service: ")
        console.log(service);

        const orders = await Order.find({ 'orderItems.service': { $in: service } });
        return res.json(orders);
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

        if (!paymentIntentId) {
            throw new NotFoundError("No paymentIntentId found with id " + id);
        }

        const order = await Order.findOne({ _id: id });
        order.paymentIntentId = paymentIntentId;
        order.status = "confirmed";
        await order.save();
        return res.status(StatusCodes.OK).send({ order, redirectUrl: `/orders/${order._id}` });
    });




module.exports = router;