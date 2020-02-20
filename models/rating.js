const mongoose = require("mongoose");

var RatingSchema = mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },
  rating: {
    type: Number
  },
  users: {
    type: Number
  }
});

RatingSchema.virtual("averageRating").get(function() {
  return this.rating / this.users;
});

var Rating = mongoose.model("Rating", RatingSchema);

module.exports = Rating;
