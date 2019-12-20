const express = require("express");
const VideoInsight = require("../models/video_insight");
const UserInsight = require("../models/user_insight");

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

router.post("/api/insight/user", async (req, res) => {
  let uid = req.body.uid;
  let vid = req.body.vid;
  let questions = req.body.questions;
  let checkpoints = req.body.checkpoints;
  try {
    let userInsight = await UserInsight.findOne({ user: uid });
    if (!userInsight) {
      userInsight = UserInsight({ user: uid });
    }
    let found = false;
    userInsight.videos.forEach(video => {
      if ((video.video = vid)) {
        video.questions = questions;
        video.checkpoints = checkpoints;
        found = true;
      }
    });
    if (!found) {
      userInsight.videos.push({
        video: vid,
        questions: questions,
        checkpoints: checkpoints
      });
    }
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
