const { CustomAPIError, UnauthenticatedError, UnauthorizedError } = require("../errors");
const { StatusCodes } = require('http-status-codes');

const isLoggedIn = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        console.log(req.session.returnTo);
        return res.status(StatusCodes.UNAUTHORIZED).send({ msg: "You must be logged in to view this", redirectUrl: "/login" });
    }

    next();
}

const storeReturnTo = async (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const authorizeUser = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.roles)) {
            throw new UnauthorizedError("You are not authorized to access this page");
        }
        next();
    };
}

const checkPermission = async function (requestUser, resource) {
    if (requestUser.roles === "admin") {
        return;
    }

    if (requestUser._id.toString() === resource.user.toString()) {
        return;
    }

    throw new UnauthorizedError("You are not allowed to do this action!!");
};

module.exports = { isLoggedIn, storeReturnTo, authorizeUser, checkPermission };