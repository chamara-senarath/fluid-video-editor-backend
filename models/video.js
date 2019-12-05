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
  ],
  questions: [
    {
      question: {
        type: String
      },
      options: {
        id: {
          type: String
        },
        text: {
          type: String
        }
      },
      correctAnswer: {
        type: String
      },
      points: {
        type: Number
      },
      duration: {
        type: Number
      },
      checked: {
        type: Boolean
      }
    }
  ]
});

var Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
