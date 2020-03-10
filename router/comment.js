const express = require("express");
const Comment = require("../models/comment");
const router = new express.Router();

router.post("/api/comment", async (req, res) => {
  let body = {
    vid: req.body.vid,
    comment: req.body.comment
  };
  let comment = null;
  comment = await Comment.findOne({ video: body.vid });
  if (!comment) {
    comment = Comment({ video: body.vid });
  }
  comment.comments.push(body.comment);
  try {
    await comment.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

router.get("/api/comment", async (req, res) => {
  let vid = req.query.vid;
  try {
    let comments = await Comment.findOne(
      { video: vid },
      { comments: 1, _id: 0 }
    );
    let result = comments.comments.sort((a, b) => b.time - a.time);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.toString());
  }
});
module.exports = router;
