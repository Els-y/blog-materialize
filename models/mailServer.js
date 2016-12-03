var nodemailer = require('nodemailer');
var fs = require('jade');
var config = require('../modules/config');

var transporter = nodemailer.createTransport(config.mailServer);

var mailOptions = {
    from: config.mailServer.auth.user,
    to: null,
    subject: null,
    text: null,
    html: null
};

function sendMail(to, subject, text, html) {
  console.log('arguments to: ' + to);
  mailOptions.to = to;
  mailOptions.subject = subject;
  mailOptions.text = text;
  mailOptions.html = html;

  // console.log(config.mailServer);
  // console.log(mailOptions);

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
        console.log(err);
    } else {
        console.log('Message sent: ' + info.response);
    }
  });
}

exports.sendMail = sendMail;
