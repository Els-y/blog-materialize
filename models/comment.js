var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var commentSchema = new Schema({
  article: {type: Schema.Types.ObjectId, ref: 'articles'},
  author: {type: Schema.Types.ObjectId, ref: 'users'},
  content: String,
  time: Date,
  replies: [{type: Schema.Types.ObjectId, ref: 'replies'}],
});

module.exports = mongoose.model('comments', commentSchema);
