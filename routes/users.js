var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();

var Promise = require('bluebird');
var userPromise = require('../modules/promise/userPromise');

var validator = require('../modules/validator');
var authority = require('../modules/authority');
var User = require('../models/user');

/* GET users listing. */
router.get('/settings', authority.checkHasLogin);
router.get('/settings', csrfProtection, function(req, res, next) {
  res.render('users/settings', {csrfToken: req.csrfToken()});
});

router.post('/resetpassword', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
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

    userPromise.findUserByNamePromise(req.session.forgot_username).then(function(user) {
      user.encrypt = false;
      user.password = req.body.password;

      return new Promise(function(resolve, reject) {
        user.save(function(err) {
          if (err) reject('Database error');
          else resolve();
        });
      });
    }).catch(function(reason) {
      status.err = reason;
    }).finally(function() {
      res.send(status);
    });
  }
});

router.post('/changepassword', authority.checkHasLogin);
router.post('/changepassword', csrfProtection, function(req, res, next) {
  var status = {
    success: false,
    err: null
  };

  if (!validator.checkPassword(req.body.oldpassword) ||
      !validator.checkPassword(req.body.newpassword) ||
      !validator.checkPassword(req.body.confirmnew)) {
    status.err = 'Invalid password';
    res.send(status);
  } else if (!validator.checkSame(req.body.newpassword, req.body.confirmnew)) {
    status.err = 'Passwords are not consistent';
    res.send(status);
  } else {
    userPromise.findUserByNamePromise(req.session.user.username)
    .then(function(user) {
      if (user.comparePassword(req.body.oldpassword)) {
        status.success = true;
        user.encrypt = false;
        user.password = req.body.newpassword;

        return new Promise(function(resolve, reject) {
          user.save(function(err) {
            if (err) reject('Database error');
            else resolve(user);
          });
        });
      } else {
        return Promise.reject('Password error');
      }
    }).then(function(user) {
      req.session.user = user;
    }).catch(function(reason) {
      status.err = reason;
    }).finally(function() {
      res.send(status);
    });

  }
});

module.exports = router;
