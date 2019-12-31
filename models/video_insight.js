const mongoose = require("mongoose");

var VideoInsightSchema = mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },
  views: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      date: { type: Date, default: Date.now }
    }
  ]
});

VideoInsightSchema.virtual("totalViews").get(function() {
  return this.views.length;
});

var VideoInsight = mongoose.model("VideoInsight", VideoInsightSchema);

module.exports = VideoInsight;
