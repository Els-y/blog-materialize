var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var avatarScheMa = new Schema({
  name: String,
  src: String,
});

module.exports = mongoose.model('avatars', avatarScheMa);
