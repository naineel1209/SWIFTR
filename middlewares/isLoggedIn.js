const { CustomAPIError, UnauthenticatedError } = require("../errors");
const { StatusCodes } = require('http-status-codes');

const isLoggedIn = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        return res.status(StatusCodes.UNAUTHORIZED).send({ msg: "You must be logged in to view this", redirectUrl: "/login" });
    }

    return next();
}

const storeReturnTo = async (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }

    next();
}

module.exports = { isLoggedIn, storeReturnTo };