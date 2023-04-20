const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const passport = require('passport');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const { isLoggedIn, storeReturnTo } = require('../middlewares//isLoggedIn')


// PATH -> /api/v1/auth/ 
router
    .route('/register')
    .post(async function (req, res) {
        //getting data from body;
        const { username, password, email, roles, phone, address, city, state } = req.body;

        if (User.countDocuments() <= 5) {
            roles = [...roles, "admin"];
        }

        const user = new User({ username, email, roles, phone, address, city, state });

        const newUser = await User.register(user, password);
        req.login(newUser, (err) => {
            if (err) {
                throw CustomError.CustomAPIError("Couldn't Login User");
            } else {
                return res.status(StatusCodes.CREATED).json({ msg: "User Created Successfully", user: newUser, redirectUrl: "/" });
                // return res.redirect('/');
            }
        });
        // return res.status(StatusCodes.CREATED).json({ user: newUser });
    });

router
    .route('/login')
    .post(storeReturnTo, passport.authenticate('local', { failureRedirect: '/loginError' }), async function (req, res) {
        //passport middleware will do its work
        res.send({ msg: "User Logged In Successfully", user: req.user, redirectUrl: res.locals.returnTo || '/' });
    });

router
    .route('/logout')
    .get(async (req, res) => {
        req.logout((err) => {
            if (err) {
                throw new CustomError.CustomAPIError("Something went wrong");
            } else {
                return res.status(200).send({ msg: "Logged out successfully", redirectUrl: "/" })
                // res.redirect('/');
            }
        });
    })

module.exports = router;