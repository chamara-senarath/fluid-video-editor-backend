const express = require("express");
const Video = require("../models/video");
const Rating = require("../models/rating");
const router = new express.Router();

router.post("/api/rating", async (req, res) => {
  let vid = req.body.vid;
  let comment = req.body.comment;
  let user_rating = req.body.comment.rating;
  let uid = req.body.comment.user;
  try {
    let video = await Video.findById(vid);
    let rating = await Rating.findOne({ video: vid });
    let commentExistIndex = -1;
    let oldRating = null;
    if (rating) {
      commentExistIndex = rating.comments.findIndex(
        comment => comment.user == uid
      );
      if (commentExistIndex >= 0) {
        oldRating = rating.comments[commentExistIndex].rating;
        rating.comments[commentExistIndex] = comment;
      } else {
        rating.comments.push(comment);
      }
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

    if (video.rating) {
      if (commentExistIndex >= 0) {
        video.rating.rating -= oldRating;
        video.rating.rating = video.rating.rating + user_rating;
      } else {
        video.rating.users += 1;
        video.rating.rating = video.rating.rating + user_rating;
      }
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
    console.log(error.toString());
    res.status(400).send(error.toString());
  }
});

router.get("/api/rating/comment", async (req, res) => {
  let vid = req.query.vid;
  let option = req.query.option;
  try {
    let rating = await Rating.findOne(
      { video: vid },
      { video: 1, comments: 1 }
    );
    rating = await rating
      .populate({ path: "video", model: "Video", select: { title: 1, _id: 0 } })
      .execPopulate();

    rating = await rating
      .populate({
        path: "comments.user",
        model: "User",
        select: { name: 1, _id: 0 }
      })
      .execPopulate();
    if (option == "Highest Rating") {
      rating.comments.sort((a, b) => (a.rating < b.rating ? 1 : -1));
    }
    if (option == "Lowest Rating") {
      rating.comments.sort((a, b) => (a.rating > b.rating ? 1 : -1));
    }
    if (option == "Newest") {
      rating.comments.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    let x = [0, 0, 0, 0, 0];
    rating.comments.forEach(comment => {
      x[comment.rating - 1]++;
    });

    let count = 0;
    let ratingList = x.map(el => {
      count++;
      let obj = { rate: count, amount: el };
      return obj;
    });

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

//Retrieve Existing Rating
router.get("/api/rating/comment/me", async (req, res) => {
  let uid = req.query.uid;
  let vid = req.query.vid;
  try {
    let doc = await Rating.findOne({ video: vid, "comments.user": uid });
    let rating = doc.comments.find(comment => comment.user == uid);
    res.status(200).send({
      comment: rating.comment,
      rating: rating.rating
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
