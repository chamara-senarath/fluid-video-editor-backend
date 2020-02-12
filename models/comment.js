const mongoose = require("mongoose");

var CommentSchema = mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },
  comments: [
    {
      comment: {
        type: String
      },
      username: {
        type: String
      },
      time: {
        type: Number
      }
    }
  ]
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
