var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var commentSchema = new Schema({
  article: String, // objectid
  author: String,
  avatar: String,
  content: String,
  time: Date,
  replies: [],
});

module.exports = mongoose.model('comments', commentSchema);
