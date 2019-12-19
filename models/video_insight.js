const mongoose = require("mongoose");

var VideoInsightSchema = mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },
  views: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

var VideoInsight = mongoose.model("VideoInsight", VideoInsightSchema);

module.exports = VideoInsight;
