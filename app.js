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
const { StatusCodes } = require('http-status-codes');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//configuring redis /<**>/ headache code
const redis = require('redis');
const RedisStore = require("connect-redis").default;

const redisClient = redis.createClient();

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
    sameSite: 'none',
  },
  name: "sessionId",
}

// routes for routing
const indexRouter = require('./routes/indexRoutes');
const authRouter = require('./routes/authRoutes');
const servicesRouter = require('./routes/servicesRoutes');
const reviewsRouter = require('./routes/reviewsRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const myProfileRouter = require('./routes/myProfileRoutes')
const singleServiceReviewsRouter = require('./routes/singleServiceReviewsRoutes.js');
const { connectDB } = require('./db/connectDB');

//models for database
const User = require("./models//Users");
const Cart = require("./models/Carts");

//middleware setup
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const { isLoggedIn, storeReturnTo } = require('./middlewares//isLoggedIn');
const { NotFoundError } = require('./errors');


const app = express();
const PORT = process.env.PORT || 5000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//all important middlewares
app.use(logger('dev'));
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173",
}));
app.use(session(sessionConfig));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride("_method")); // to be used in the frontend
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "/tmp"),
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(flash());

// starting the passport middleware
app.use(passport.initialize()); //1. initialize the passport instance
app.use(passport.session()); // 2. passport to use the session
passport.use(new LocalStrategy(User.authenticate())); //3. passport is to use LocalStrategy with UserAuthentication from passport-local-mongoose
passport.serializeUser(User.serializeUser()); //4. passport to use serializeUser from passport-local-mongoose
passport.deserializeUser(User.deserializeUser()); //5. passport to use deserializeUser from passport-local-mongoose

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
//views path 
app.use('/', indexRouter);

//auth api path
app.use('/api/v1/auth', authRouter);

//services api path
app.use('/api/v1/services', isLoggedIn, servicesRouter);

// reviews api path
app.use('/api/v1/reviews', isLoggedIn, reviewsRouter);

//upload Image 
app.post("/api/v1/uploadImage", async (req, res) => {
  if (!req.files) {
    throw new NotFoundError("No image found");
  }

  if (!req.files.image.mimetype.startsWith("image")) {
    throw new Error("Please upload an valid file of Image type");
  }

  //getting the imagePath
  const imagePath = req.files.image.tempFilePath;
  // console.log("BODY -> ");
  // console.log(req.body);

  //uploading the image
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: "swiftr/testing",
    use_filename: false,
    filename_override: `${req.user._id}-service-image`,
  }).then(res => {
    console.log(res);
    return res.secure_url;
  })

  return res.send({ msg: "Image uploaded successfully", filePath: result });
});


//used in a frontend route -> get current users cart items
app
  .get("/api/v1/getCart", isLoggedIn, async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.find({ user: userId }).populate('services').populate('services.user');

    if (!cart) {
      throw new NotFoundError("Cart not found, try adding some items to your cart");
    }

    return res.status(StatusCodes.OK).send({ data: cart });
  });
app.use('/api/v1/stripe', orderRouter);

//get single productreview
app.use('/api/v1/services/:serviceId/reviews', isLoggedIn, singleServiceReviewsRouter);
app.use('/api/v1/my-profile', isLoggedIn, myProfileRouter);

//path to handle loginError
app.get('/loginError', async (req, res, next) => {
  return res.status(403).send({ msg: "Incorrect Password or Username", redirectUrl: "/login" });
});

// error handler
app.use(errorHandler);

// path not found
app.use(notFound)

//start function
async function start() {
  await connectDB(process.env.MONGO_URI);

  app.listen(PORT, () => {
    console.log("Starting server on port " + PORT);
  })
}

start();