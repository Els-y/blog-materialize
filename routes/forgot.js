var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

var config = require('../config');
var validator = require('../validator');
var User = require('../models/user');

// forgot password
router.post('/', function(req, res, next) {
  var status = {success: false,
                data: {username: req.body.username,
                       err: null,
                      }
               };

  if (!validator.checkUsername(req.body.username)) {
    status.data.err = 'Invalid username';
    return res.send(status);
  } else if (!validator.checkEmail(req.body.email)) {
    status.data.err = 'Invalid email';
    return res.send(status);
  }

  User.findOne({username: req.body.username}, function(err, user) {
    if (err) {
      status.data.err = 'Datebase error';
    } else if (user && user.email === req.body.email) {
      user.sendConfirmMail(req.headers.host, '/forgot/check/', config.secret + 'forgotPassword');
      status.success = true;
      res.cookie('forgotPassword', {uid: user._id, token: user.getUsernameToken()}, {maxAge: 1000 * 60 * 1});
    } else {
      status.data.err = 'Username or email wrong';
    }
    res.send(status);
  });
});

router.get('/check/:confirmUrl', function(req, res, next) {
  if (!checkIfForgotConfirmUrl(req.params.confirmUrl))
    return res.render('forgot/invalid');

  console.log('valid forgot confirm url');
  if (req.cookies.forgotPassword) {
    var forgot = req.cookies.forgotPassword;
    User.findById(forgot.uid, function(err, user) {
      if (user && user.compareUsernameToken(forgot.token)) {
        if (user.confirmOverdue()) return res.render('forgot/invalid');
        req.session.user = user;
        res.render('forgot/reset');
      } else {
        res.redirect('/invalid');
      }
    });
  } else {
    res.redirect('/');
  }
});

function checkIfForgotConfirmUrl(confirmUrl, token) {
  return bcrypt.compareSync(config.secret + 'forgotPassword', confirmUrl);
}

module.exports = router;
