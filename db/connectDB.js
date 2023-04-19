const mongoose = require('mongoose');

module.exports.connectDB = (URI) => {
    mongoose.connect(URI).then((val) => {
        console.log("Mongoose Connected");
    }, (err) => {
        console.log("Mongoose Error: " + err);
    });
    mongoose.set('strictQuery', false);
}