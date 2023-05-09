const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const passport = require('passport');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const { isLoggedIn, storeReturnTo } = require('../middlewares//isLoggedIn')


// PATH -> /api/v1/auth/ 

//register
router
    .route('/register')
    .post(async function (req, res) {
        //getting data from body;
        const { username, password, email, phone, address, city, state } = req.body;

        const count = await User.countDocuments({});
        let role;
        if (count <= 5) {
            role = "admin";
        }
        const roles = role || req.body.roles;

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

//login
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