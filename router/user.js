const express = require("express");
const User = require("../models/user");
const router = new express.Router();

router.post("/api/user", async (req, res) => {
  let body = {
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    location: req.body.location
  };
  let user = User(body);
  try {
    await user.save();
    res.status(200).send({ user_id: user._id });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
