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

const sessionConfig = {
  secret: "50e88e5c672934b458f665908ad4871346e6b6d6b7ecb6db4278bbc327798bf16215a7f1e429ff0b8075f5f68539b975ae690bb8703ee008627220c4fdf7acd2",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 3600 * 24 * 7,
    expires: Date.now() + 1000 * 3600 * 24 * 7,
    key: "swiftr_id"
  }
}

// routes for routing
const indexRouter = require('./routes/indexRoutes');
const usersRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes')
const { connectDB } = require('./db/connectDB');

//models for database
const User = require("./models//Users");

//middleware setup
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();
const PORT = process.env.PORT || 5000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  console.log(res.locals.currentUser);
  res.locals.returnTo = req.session.returnTo;
  next();
})

app.use('/', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/users', usersRouter);
app.get('/loginError', async (req, res, next) => {
  return res.status(403).send({ msg: "Incorrect Password or Username" });
})

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