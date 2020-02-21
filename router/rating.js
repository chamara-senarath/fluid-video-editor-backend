const express = require("express");
const Video = require("../models/video");
const Rating = require("../models/rating");
const router = new express.Router();

router.post("/api/rating", async (req, res) => {
  let vid = req.body.vid;
  let comment = req.body.comment;
  let user_rating = req.body.comment.rating;
  try {
    let video = await Video.findById(vid);
    if (video) {
      video.rating.users += 1;
      video.rating.rating = video.rating.rating + user_rating;
    } else {
      let obj = {
        rating: user_rating,
        users: 1
      };
      video.rating = obj;
    }

    video.save();

    let rating = await Rating.findOne({ video: vid });
    if (rating) {
      rating.comments.push(comment);
    }
    if (!rating) {
      let c = [];
      c.push(comment);
      rating = Rating({
        video: vid,
        comments: c
      });
    }
    rating.save();

    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

router.get("/api/rating/comment", async (req, res) => {
  let vid = req.query.vid;
  try {
    let rating = await Rating.findOne(
      { video: vid },
      { video: 1, comments: 1 }
    );
    rating = await rating
      .populate({ path: "video", model: "Video", select: { title: 1, _id: 0 } })
      .execPopulate();

    let ratingList = [];
    for (i = 1; i < 6; i++) {
      let obj = {};
      let stars = await Rating.findOne(
        {
          video: vid,
          "comments.rating": i
        },
        { _id: 0, comments: 1 }
      );
      if (!stars) {
        obj = {
          rate: i,
          amount: 0
        };
      } else {
        obj = {
          rate: i,
          amount: stars.comments.length
        };
      }
      ratingList.push(obj);
    }

    res.status(200).send({
      id: rating._id,
      title: rating.video.title,
      rating: ratingList,
      comments: rating.comments
    });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

// router.get("/api/rating", async (req, res) => {
//   let vidList = req.body.vidList;
//   try {
//     let ratingList = [];
//     for (i = 0; i < vidList.length; i++) {
//       let vid = vidList[i];
//       let rating = await Rating.findOne({ video: vid });
//       let averageRating = null;
//       let users = null;
//       if (rating) {
//         averageRating = rating.averageRating;
//         users = rating.users;
//       }
//       if (!rating) {
//         averageRating = 0;
//         users = 0;
//       }
//       let ratingItem = {
//         vid: vid,
//         rating: {
//           averageRating: averageRating,
//           users: users
//         }
//       };
//       ratingList.push(ratingItem);
//     }
//     res.status(200).send({ ratingList });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

module.exports = router;
