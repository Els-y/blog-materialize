var express = require('express');
var router = express.Router();
var csrf = require('csurf');

var csrfProtection = csrf();
/* GET users listing. */
router.get('/', csrfProtection, function(req, res, next) {
  res.render('articles/articles', {csrfToken: req.csrfToken()});
});

module.exports = router;
