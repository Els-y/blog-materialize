var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var csrf = require('csurf');
var csrfProtection = csrf();

var Promise = require('bluebird');
var userPromise = require('../modules/promise/userPromise');
var validator = require('../modules/validator');
var User = require('../models/user');

// forgot password
router.post('/', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    data: {
      username: req.body.username,
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

  userPromise.findUserByNamePromise(req.body.username).then(function(user) {
    if (user.email === req.body.email) {
      status.success = true;
      req.session.token = crypto.randomBytes(8).toString('hex');
      res.cookie('forgotPassword', {uid: user._id, token: user.getUsernameToken(req.session.token)}, {maxAge: 1000 * 60 * 5});

      User.sendForgotConfirmMail(user.email, req.headers.host, req.session.token);
    } else {
      status.data.err = 'Username or email wrong';
    }
  }).catch(function(reason) {
    status.data.err = reason;
  }).finally(function() {
    res.send(status);
  });
});

router.get('/check/:confirmUrl', csrfProtection, function(req, res, next) {
  if (!User.checkIfForgotConfirmUrl(req.params.confirmUrl, req.session.token))
    return res.render('forgot/invalid',  {csrfToken: req.csrfToken()});

  if (req.cookies.forgotPassword) {
    var forgot = req.cookies.forgotPassword;

    userPromise.findUserByIdPromise(forgot.uid).then(function(user) {
      if (user.compareUsernameToken(forgot.token)) {
        req.session.forgot_username = user.username;
        res.clearCookie('forgotPassword');
        res.render('forgot/reset', {csrfToken: req.csrfToken()});
      } else {
        res.render('forgot/invalid', {csrfToken: req.csrfToken()});
      }
    }).catch(function(reason) {
      console.log(reason);
      res.redirect('/');
    });

    // User.findById(forgot.uid, function(err, user) {
    //   if (user && user.compareUsernameToken(forgot.token)) {
    //     req.session.forgot_username = user.username;
    //     res.clearCookie('forgotPassword');
    //     res.render('forgot/reset', {csrfToken: req.csrfToken()});
    //   } else {
    //     res.render('forgot/invalid', {csrfToken: req.csrfToken()});
    //   }
    // });
  } else {
    res.redirect('/');
  }
});


module.exports = router;
