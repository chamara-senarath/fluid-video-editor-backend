const express = require("express");
const Video = require("../models/video");
const router = new express.Router();

router.post("/api/rating", async (req, res) => {
  let vid = req.body.vid;
  let user_rating = req.body.rating;
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
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
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
