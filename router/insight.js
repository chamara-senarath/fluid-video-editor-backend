const express = require("express");
const VideoInsight = require("../models/video_insight");
const UserInsight = require("../models/user_insight");
const User = require("../models/user");
const router = new express.Router();
const { getPercentage } = require("../utils/functions");
const moment = require("moment");
//post video insight
router.post("/api/insight/video", async (req, res) => {
  let vid = req.body.vid;
  let uid = req.body.uid;
  try {
    let videoInsight = await VideoInsight.findOne({ video: vid });
    if (!videoInsight) {
      videoInsight = VideoInsight({ video: vid });
    }
    if (!videoInsight.views.includes({ user: uid })) {
      videoInsight.views.push({ user: uid });
    }
    await videoInsight.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

//post user insight
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
      if (video.video == vid) {
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
    await userInsight.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

//retrieve views for a given video
router.get("/api/insight/views", async (req, res) => {
  let vid = req.query.vid;
  let range = req.query.range.split(",");
  let lastWeekViews = 0;
  let lastMonthViews = 0;
  let lastYearViews = 0;
  let totalViews = 0;
  let viewsByGender = {};
  let viewsByAge = {};
  let viewsByLocation = {};

  function isBetween(timestamp) {
    last_week = moment()
      .subtract(7, "days")
      .calendar();
    last_month = moment()
      .subtract(7, "months")
      .calendar();
    last_year = moment()
      .subtract(7, "years")
      .calendar();

    let week = moment(timestamp).isBetween(
      moment(last_week, "MM-DD-YYYY"),
      moment()
    );
    let month = moment(timestamp).isBetween(
      moment(last_month, "MM-DD-YYYY"),
      moment()
    );
    let year = moment(timestamp).isBetween(
      moment(last_year, "MM-DD-YYYY"),
      moment()
    );

    return {
      week,
      month,
      year
    };
  }

  try {
    let videoInsight = await VideoInsight.findOne({ video: vid });
    if (videoInsight) {
      let users = [];
      totalViews = videoInsight.totalViews;
      for (let i = 0; i < videoInsight.views.length; i++) {
        let item = videoInsight.views[i];
        let user = await User.findById(videoInsight.views[i].user);
        users.push(user);
        viewsByGender = getPercentage(users, "gender");
        viewsByAge = getPercentage(users, "age", range);
        viewsByLocation = getPercentage(users, "location");
        if (isBetween(item.date).week) {
          lastWeekViews++;
        }
        if (isBetween(item.date).month) {
          lastMonthViews++;
        }
        if (isBetween(item.date).year) {
          lastYearViews++;
        }
      }
    }
    res.status(200).send({
      totalViews,
      lastWeekViews,
      lastMonthViews,
      lastYearViews,
      viewsByGender,
      viewsByAge,
      viewsByLocation
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

//retrieve user insights
router.get("/api/insight/user", async (req, res) => {
  let uid = req.query.uid;
  let vid = req.query.vid;
  let user_video = null;
  try {
    let userInsight = await UserInsight.findOne({ user: uid });
    userInsight.videos.forEach(video => {
      if (video.video == vid) {
        user_video = {
          questions: video.questions,
          checkpoints: video.checkpoints
        };
      }
    });
    res.status(200).send(user_video);
  } catch (error) {
    res.status(400).send(error);
  }
});

//get most watched video
router.get("/api/insight/most_watched", async (req, res) => {
  try {
    let videoInsight = await VideoInsight.find();
    let totalViews = 0;
    let most_watched;
    videoInsight.forEach(video => {
      if (video.totalViews > totalViews) {
        totalViews = video.totalViews;
        most_watched = video.video;
      }
    });
    res.status(200).send({ id: most_watched });
  } catch (error) {
    res.status(400).send(error);
  }
});

//get least watched video
router.get("/api/insight/least_watched", async (req, res) => {
  try {
    let videoInsight = await VideoInsight.find();
    let totalViews = videoInsight[0].totalViews;
    let least_watched;
    videoInsight.forEach(video => {
      if (video.totalViews < totalViews) {
        totalViews = video.totalViews;
        least_watched = video.video;
      }
    });
    res.status(200).send({ id: least_watched });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
