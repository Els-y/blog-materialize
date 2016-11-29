var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var fs = require('fs');
var jade = require('jade');
var mailServer = require('./mailServer');
var config = require('../config');

var Schema = mongoose.Schema;
var userScheMa = new Schema({
  username: String,
  email: String,
  password: String,
  avatar: String,
  registDate: Date,
  confirmDate: Date,
  confirmed: Boolean,
  role: Number,
  encrypt: Boolean
});

// regist
userScheMa.pre('save', function(next) {
  if (!this.encrypt) {
    var salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    this.encrypt = true;
  }
  next();
});

// statics
userScheMa.statics.encodeInfo = function(info) {
  var salt = bcrypt.genSaltSync(10);
  return encodeURIComponent(bcrypt.hashSync(info, salt));
};

userScheMa.statics.getCompleteUrl = function(host, route, token) {
  return config.protocol + '://' + host + route + token;
};

userScheMa.statics.sendConfirmMail = function(email, confirmUrl) {
  var text, html;

  fs.readFile('./public/mail/confirmMail.txt', function(err, txtData) {
    text = txtData.toString().replace(/#\{confirmUrl\}/g, confirmUrl);
    fs.readFile('./public/mail/confirmMail.jade', function(err, jadeData) {
      var cp = jade.compile(jadeData.toString());
      html = cp({confirmUrl: confirmUrl});
      mailServer.sendMail(email, '[Microblog] Confirm information', text, html);
    });
  });
};

userScheMa.statics.sendForgotConfirmMail = function(email, host, token) {
  var confirmUrl = userScheMa.statics.getCompleteUrl(host, '/forgot/check/', userScheMa.statics.encodeInfo(config.secret + 'forgotPassword' + token));

  userScheMa.statics.sendConfirmMail(email, confirmUrl);
};

userScheMa.statics.checkIfForgotConfirmUrl = function(confirmUrl, token) {
  return bcrypt.compareSync(config.secret + 'forgotPassword' + token, confirmUrl);
};

// methods
userScheMa.methods.comparePassword = function(pwd) {
  return bcrypt.compareSync(pwd, this.password);
};

userScheMa.methods.sendRegistConfirmMail = function(host) {
  var that = this;
  this.confirmDate = Date();

  var confirmUrl = userScheMa.statics.getCompleteUrl(host, '/confirm/check/', userScheMa.statics.encodeInfo(this.username + this.confirmDate));

  this.save(function() {
    userScheMa.statics.sendConfirmMail(that.email, confirmUrl);
  });
};

userScheMa.methods.confirmOverdue = function() {
  var nowTime = new Date();
  var confirmTime = new Date(this.confirmDate);
  var expireTime = new Date(confirmTime.getTime() + 5 * 60 * 1000);

  if (nowTime > expireTime) return true;
  else return false;
};

userScheMa.methods.confirmAccount = function(confirmHash) {
  if (this.confirmOverdue() || !bcrypt.compareSync(this.username + this.confirmDate, confirmHash)) {
    return false;
  } else {
    this.confirmed = true;
    this.save();
    return true;
  }
};

// cookie
userScheMa.methods.getUsernameToken = function() {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(this.username, salt);
};

userScheMa.methods.compareUsernameToken = function(token) {
  return bcrypt.compareSync(this.username, token);
};


module.exports = mongoose.model('users', userScheMa);
