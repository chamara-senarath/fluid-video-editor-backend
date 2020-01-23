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

router.get("/api/user", async (req, res) => {
  let id = req.query.id;
  try {
    let user = await User.findById(id);
    if (user) {
      res.status(200).send();
    } else {
      res.status(204).send();
    }
  } catch (error) {
    res.status(204).send();
  }
});
module.exports = router;
