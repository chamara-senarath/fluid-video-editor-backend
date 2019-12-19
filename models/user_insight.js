const mongoose = require("mongoose");

var UserInsightSchema = mongoose.Schema({
  type: {
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
            answered: {
              type: Boolean
            },
            skipped: {
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
  }
});

var UserInsight = mongoose.model("UserInsight", UserInsightSchema);

module.exports = UserInsight;
