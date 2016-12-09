var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var replySchema = new Schema({
  author: {type: Schema.Types.ObjectId, ref: 'users'},
  content: String,
  time: Date,
});

module.exports = mongoose.model('replies', replySchema);
