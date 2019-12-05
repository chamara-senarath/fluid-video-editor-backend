const mongoose = require("mongoose");

var VideoSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  splashDuration: {
    type: Number
  },
  chapterMarks: [
    {
      startTime: {
        type: Number
      },
      text: {
        type: String
      }
    }
  ]
});

var Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
