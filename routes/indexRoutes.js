const express = require('express');
const router = express.Router();
const { isLoggedIn, storeReturnTo } = require('../middlewares//isLoggedIn')

/* GET home page. */
router.get('/', isLoggedIn, function (req, res, next) {
  console.log(req.cookies);
  res.render('index', { title: 'Express' });
});

module.exports = router;
