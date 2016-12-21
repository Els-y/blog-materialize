var nodemailer = require('nodemailer');
var fs = require('jade');
var config = require('./config');

var transporter = nodemailer.createTransport(config.mailServer);

var mailOptions = {
    from: config.mailServer.auth.user,
    to: null,
    subject: null,
    text: null,
    html: null
};

function sendMail(to, subject, text, html) {
  mailOptions.to = to;
  mailOptions.subject = subject;
  mailOptions.text = text;
  mailOptions.html = html;

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
        console.log(err);
    } else {
        console.log('Message sent: ' + info.response);
    }
  });
}

exports.sendMail = sendMail;
