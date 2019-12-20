const express = require("express");
const VideoInsight = require("../models/video_insight");
const User = require("../models/user");

const router = new express.Router();
const { getPercentage } = require("../utils/functions");
router.post("/api/insight/video", async (req, res) => {
  let vid = req.body.vid;
  let uid = req.body.uid;
  try {
    let videoInsight = await VideoInsight.findOne({ video: vid });
    if (!videoInsight) {
      videoInsight = VideoInsight({ video: vid });
    }
    if (!videoInsight.views.includes(uid)) {
      videoInsight.views.push(uid);
    }
    await videoInsight.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/api/insight/views", async (req, res) => {
  let vid = req.query.vid;
  let range = [0, 20, 25];
  let totalViews = 0;
  let viewsByGender = {};

  let viewsByAge = {};
  let viewsByLocation = {};

  try {
    let videoInsight = await VideoInsight.findOne({ video: vid });
    if (videoInsight) {
      let users = [];
      totalViews = videoInsight.views.length;
      for (let i = 0; i < videoInsight.views.length; i++) {
        let user = await User.findById(videoInsight.views[i]);
        users.push(user);
        viewsByGender = getPercentage(users, "gender");
        viewsByAge = getPercentage(users, "age", range);
        viewsByLocation = getPercentage(users, "location");
      }
    }
    res
      .status(200)
      .send({ totalViews, viewsByGender, viewsByAge, viewsByLocation });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
