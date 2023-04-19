const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const passport = require('passport');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

// PATH -> /api/v1/auth/ 

router
    .route('/register')
    .post(async function (req, res) {
        //getting data from body;
        const { username, password, email, roles, phone, address, city, state } = req.body;

        const user = new User({ username, email, roles, phone, address, city, state });
        const newUser = await User.register(user, password);
        req.login(newUser, (err) => {
            if (err) {
                throw CustomError.CustomAPIError("Couldn't Login User");
            } else {
                return res.status(StatusCodes.CREATED).json({ msg: "User Created Successfully", user: newUser });
            }
        });
        // return res.status(StatusCodes.CREATED).json({ user: newUser });
    });

router
    .route('/login')
    .post(passport.authenticate('local', { failureRedirect: '/loginError' }), async function (req, res) {
        //passport middleware will do its work
        res.send({ msg: "User Logged In Successfully", user: req.user });
    });


module.exports = router;