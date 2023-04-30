require('dotenv').config();
const express = require('express');
const router = express.Router();
const { isLoggedIn, storeReturnTo } = require('../middlewares//isLoggedIn');
const stripe = require('stripe')(process.env.STRIPE_SERVER_KEY);
const getRawBody = require('raw-body');
const { create } = require('../models/Services');

const Order = require('../models/Orders');
const Cart = require('../models/Carts');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.cookies);
  res.render('index', { title: 'Express' });
});

router
  .route('/checkout')
  .get(async (req, res) => {
    res.render('checkout');
  })
  .post(async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: 'inr',
          unit_amount: 25 * 100,
          product_data: {
            name: "T-shirt",
          },
        },
        quantity: 2,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/success`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
      client_reference_id: req.user._id,
    })
    res.redirect(303, session.url);
  });

async function createOrder(customer, checkoutSession) {

  const Items = JSON.parse(customer.metadata.order);
  const userId = JSON.parse(customer.metadata.userId);
  Items.user = userId;
  Items.stripeSessionId = checkoutSession.id;

  const order = new Order(Items);
  await order.save();
  console.log('Order created');
  console.log(order);

  // await Cart.deleteMany({ user: userId });
}

const endpointSecret = process.env.ENDPOINT_SECRET;
router.post('/webhook', (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;
  //rawBody is a buffer and parsed in the app.js file under express.json() middleware

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

router.get('/success', function (req, res) {
  res.send('Success');
});

router.get('/cancel', function (req, res) {
  res.send('Cancelled');
});

module.exports = router;
