const { StatusCodes } = require('http-status-codes');
const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        // set default
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong try again later',
    };

    if (err.name === 'UserExistsError') {
        // Handle user exists errors
        customError.statusCode = 409;
        customError.msg = "User already exists";
        // res.status(409).send({ msg: 'User already exists' });
    }

    if (err.name === 'IncorrectPasswordError') {
        // Handle incorrect password errors
        customError.statusCode = 401;
        customError.msg = "Invalid username or password";
        res.status(401).send({ msg: 'Invalid username or password' });
    }

    if (err.name === 'ValidationError') {
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(',');
        customError.statusCode = 400;
    }

    if (err.code && err.code === 11000) {
        customError.msg = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value`;
        customError.statusCode = 400;
    }

    if (err.name === 'CastError') {
        customError.msg = `No item found with id : ${err.value}`;
        customError.statusCode = 404;
    }

    console.log("Error?? ", customError.msg)

    return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
