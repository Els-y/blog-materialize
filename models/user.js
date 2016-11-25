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

userScheMa.methods.comparePassword = function(pwd) {
  return bcrypt.compareSync(pwd, this.password);
};

userScheMa.methods.sendConfirmMail = function(host, route, info) {
  var text, html;
  var that = this;

  this.confirmDate = Date();
  this.save(function() {
    var confirmUrl = that.getConfirmUrl(host, route, info);
    fs.readFile('./public/mail/confirmMail.txt', function(err, txtData) {
      text = txtData.toString().replace(/#\{confirmUrl\}/g, confirmUrl);
      fs.readFile('./public/mail/confirmMail.jade', function(err, jadeData) {
        var cp = jade.compile(jadeData.toString());
        html = cp({confirmUrl: confirmUrl});
        mailServer.sendMail(that.email, '[Microblog] Confirm information', text, html);
      });
    });
  });
};

userScheMa.methods.getConfirmUrl = function(host, route, info) {
  var salt = bcrypt.genSaltSync(10);
  // return config.protocol + '://' + host + route + encodeURIComponent(bcrypt.hashSync(this.username　+ this.confirmDate, salt));
  return config.protocol + '://' + host + route + encodeURIComponent(bcrypt.hashSync(info, salt));
};

userScheMa.methods.confirmOverdue = function() {
  var nowTime = new Date();
  var confirmTime = new Date(this.confirmDate);
  var expireTime = new Date(confirmTime.getTime() + 5 * 60 * 1000);

  if (nowTime > expireTime) return true;
  else return false;
};

userScheMa.methods.confirmAccount = function(confirmHash) {
  if (this.confirmOverdue()) {
    return 1;  // expire
  } else if (!bcrypt.compareSync(this.username, confirmHash)) {
    return 2;  // wrong hash
  } else {
    this.confirmed = true;
    this.save();
    return 0;  // correct
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
