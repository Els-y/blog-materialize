var express = require('express');
var router = express.Router();
var validator = require('../validator');
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/resetpassword', checkOperationIsResetPassword);
router.post('/resetpassword', function(req, res, next) {
  var status = {success: false,
                err: null
               };

  if (!validator.checkPassword(req.body.password) || !validator.checkPassword(req.body.confirm)) {
    status.err = 'Invalid password';
    res.send(status);
  } else if (!validator.checkSame(req.body.password, req.body.confirm)) {
    status.err = 'Passwords are not consistent';
    res.send(status);
  } else {
    status.success = true;
    req.session.operation = null;
    // req.session.user = null;
    User.findOne({username: req.session.user.username}, function(err, user) {
      user.encrypt = false;
      user.password = req.body.password;

      user.save(function() {
        req.session.user = null;
        res.send(status);
      });
    });
  }

});

// check operation == reset
function checkOperationIsResetPassword(req, res, next) {
  if (req.session.operation && req.session.operation === 'reset-password') {
    next();
  } else {
    res.redirect('/');
  }
}

// check if login
function checkHasLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
}
module.exports = router;
