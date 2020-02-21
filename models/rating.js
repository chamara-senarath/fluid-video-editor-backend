const mongoose = require("mongoose");

var RatingSchema = mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },
  comments: [
    {
      username: {
        type: String
      },
      comment: {
        type: String
      },
      rating: {
        type: Number
      }
    }
  ]
});

var Rating = mongoose.model("Rating", RatingSchema);

module.exports = Rating;
