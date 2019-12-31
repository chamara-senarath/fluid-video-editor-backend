const mongoose = require("mongoose");

var UserInsightSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  videos: [
    {
      video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
      },
      questions: [
        {
          question: {
            type: mongoose.Schema.Types.ObjectId
          },
          points: {
            type: Number
          },
          is_answered: {
            type: Boolean
          },
          is_correct: {
            type: Boolean
          },
          is_skipped: {
            type: Boolean
          }
        }
      ],
      checkpoints: [
        {
          start: {
            type: Number
          },
          end: {
            type: Number
          }
        }
      ]
    }
  ]
});

var UserInsight = mongoose.model("UserInsight", UserInsightSchema);

module.exports = UserInsight;
