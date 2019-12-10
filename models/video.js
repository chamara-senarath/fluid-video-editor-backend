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
      options: [
        {
          text: {
            type: String
          }
        }
      ],
      answer: {
        type: String
      },
      points: {
        type: Number
      },
      startTime: {
        type: Number
      },
      duration: {
        type: Number
      },
      checked: {
        type: Boolean
      },
      correct: {
        type: Boolean
      },
      isTimed: {
        type: Boolean
      }
    }
  ]
});

var Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
