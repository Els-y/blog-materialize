var jade = require('jade');
var fs = require('fs');

var cm = jade.compile(fs.readFileSync('confirmMail.jade'));
console.log(cm({confirmUrl: 'http://asdasd.com'}));
