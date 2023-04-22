// modules required
require('express-async-errors');
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');

//configuring redis /<**>/ headache code
const redis = require('redis');
const RedisStore = require("connect-redis").default;

const redisClient = redis.createClient({
  port: 6379,
  host: 'localhost',
});

//create a redis client and then connect to it;
redisClient.connect().catch(console.error);
let redisStore = new RedisStore({ client: redisClient });

const sessionConfig = {
  store: redisStore,
  secret: "50e88e5c672934b458f665908ad4871346e6b6d6b7ecb6db4278bbc327798bf16215a7f1e429ff0b8075f5f68539b975ae690bb8703ee008627220c4fdf7acd2",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 3600 * 24 * 7,
    name: "swiftr_id",
    httpOnly: true,
    secure: false,
  },
  name: "sessionId",
}

// routes for routing
const indexRouter = require('./routes/indexRoutes');
const authRouter = require('./routes/authRoutes');
const servicesRouter = require('./routes/servicesRoutes');
const reviewsRouter = require('./routes/reviewsRoutes');
const singleServiceReviewsRouter = require('./routes/singleServiceReviewsRoutes.js');
const { connectDB } = require('./db/connectDB');

//models for database
const User = require("./models//Users");

//middleware setup
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const { isLoggedIn, storeReturnTo } = require('./middlewares//isLoggedIn')


const app = express();
const PORT = process.env.PORT || 5000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//all important middlewares
app.use(logger('dev'));
app.use(session(sessionConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// starting the passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to handle the current user
app.use((req, res, next) => {

  console.log(req.isAuthenticated());
  res.locals.currentUser = req.user;

  console.log(res.locals.currentUser);
  res.locals.returnTo = req.session.returnTo;

  next();
})


//route to handle requests

//TODO: all the get routes go in the indexRouter
app.use('/', indexRouter);  //views path 
app.use('/api/v1/auth', authRouter); //auth api path
app.use('/api/v1/services', isLoggedIn, servicesRouter); //services api path
app.use('/api/v1/reviews', isLoggedIn, reviewsRouter)
app.use('/api/v1/services/:serviceId/reviews', isLoggedIn, singleServiceReviewsRouter); //get single product review

//path to handle loginError
app.get('/loginError', async (req, res, next) => {
  return res.status(403).send({ msg: "Incorrect Password or Username", redirectUrl: "/login" });
});

// error handler
app.use(errorHandler);
// path not found
app.use(notFound)

async function start() {
  await connectDB(process.env.MONGO_URI);

  app.listen(PORT, () => {
    console.log("Starting server on port " + PORT);
  })
}

start();