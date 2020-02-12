const express = require("express");
const Video = require("../models/video");
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
  let percentage = req.body.percentage;
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
        video.percentage =
          video.percentage >= percentage ? video.percentage : percentage;
        video.checkpoints = checkpoints;
        found = true;
        return;
      }
    });
    if (!found) {
      userInsight.videos.push({
        video: vid,
        questions: questions,
        percentage: percentage,
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
        let user = await User.findById(item.user);
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
  let questions = [];
  let percentage = 0;
  try {
    let video = await Video.findById(vid);
    if (!video) {
      throw Error("Video not Found");
    }
    let insight = await UserInsight.findOne({
      user: uid,
      videos: { $elemMatch: { video: vid } }
    });

    let insightQuestions = [];
    if (insight) {
      let video = insight.videos.find(video => video.video == vid);
      percentage = video.percentage;
      insightQuestions = [
        ...insight.videos
          .filter(video => video.video == vid)
          .map(obj => {
            return obj.questions;
          })[0]
      ];
    }
    let videoQuestions = video.questions;
    videoQuestions.forEach(question => {
      let q = {
        _id: question._id,
        qid: question._id,
        options: question.options,
        question: question.question,
        answer: question.answer,
        duration: question.duration,
        startTime: question.startTime,
        points: question.points,
        is_answered: false,
        is_skipped: false,
        is_correct: false,
        earn: 0
      };
      questions.push(q);
    });

    for (let i = 0; i < questions.length; i++) {
      let videoQuestion = questions[i];
      for (let j = 0; j < insightQuestions.length; j++) {
        let insightQuestion = insightQuestions[j];
        if (videoQuestion._id.toString() == insightQuestion.qid.toString()) {
          questions[i].is_answered = insightQuestion.is_answered;
          questions[i].is_skipped = insightQuestion.is_skipped;
          questions[i].is_correct = insightQuestion.is_correct;
          questions[i].earn = insightQuestion.earn;
        }
      }
    }
    res.status(200).send({ percentage, questions });
  } catch (error) {
    res.status(400).send(error);
  }
});

//retrieve all videos of a user
router.get("/api/insight/user/all", async (req, res) => {
  let uid = req.query.uid;
  let videos = null;
  try {
    videos = await UserInsight.findOne(
      { user: uid },
      { _id: 0, "videos.video": 1, "videos.percentage": 1 }
    );
    videos = await videos
      .populate({
        path: "videos.video",
        model: "Video",
        select: { title: 1 }
      })
      .execPopulate();

    res.status(200).send(videos);
  } catch (error) {
    res.status(400).send(error);
  }
});

//retrieve videos of a user by name
router.get("/api/insight/user/search", async (req, res) => {
  let key = req.query.key;
  let option = null;
  if (req.query.option == "Title") {
    option = "title";
  }
  if (req.query.option == "Author") {
    option = "authors";
  }
  if (req.query.option == "Tag") {
    option = "tags";
  }
  let uid = req.query.uid;
  let videos = null;
  try {
    videos = await UserInsight.findOne(
      { user: uid },
      { _id: 0, "videos.video": 1 }
    );
    let match = {};
    match[option] = { $regex: key, $options: "i" };
    videos = await videos
      .populate({
        path: "videos.video",
        model: "Video",
        select: { title: 1 },
        match: match
      })
      .execPopulate();
    if (videos.videos[0].video == null) {
      videos.videos = [];
    }
    res.status(200).send(videos.videos);
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
      if (video.totalViews >= totalViews) {
        totalViews = video.totalViews;
        most_watched = video.video;
      }
    });
    let video = await Video.findById(most_watched);

    res
      .status(200)
      .send({ id: most_watched, title: video.title, views: totalViews });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//get least watched video
router.get("/api/insight/least_watched", async (req, res) => {
  try {
    let videoInsight = await VideoInsight.find();
    let totalViews = videoInsight[0].totalViews;
    let least_watched;
    videoInsight.forEach(video => {
      if (video.totalViews <= totalViews) {
        totalViews = video.totalViews;
        least_watched = video.video;
      }
    });
    let video = await Video.findById(least_watched);
    res
      .status(200)
      .send({ id: least_watched, title: video.title, views: totalViews });
  } catch (error) {
    res.status(400).send(error);
  }
});

//get summary
router.get("/api/insight/summary", async (req, res) => {
  try {
    let summary = [];
    let videoInsight = await VideoInsight.find();
    for (let i = 0; i < videoInsight.length; i++) {
      let vid = await videoInsight[i].populate("video").execPopulate();
      let totalViews = vid.totalViews;
      let id = vid.video._id;
      let title = vid.video.title;
      summary.push({ id, title, totalViews });
    }
    res.status(200).send(summary);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
