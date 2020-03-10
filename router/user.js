const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const auth_user = require("../middleware/auth_user");

//register
router.post("/api/user", async (req, res) => {
  let password = req.body.password;
  let body = {
    username: req.body.username,
    name: req.body.name,
    group: req.body.group,
    age: req.body.age,
    gender: req.body.gender,
    location: req.body.location
  };
  let hashedPassword = bcrypt.hashSync(password, 8);
  let user = User({ ...body, password: hashedPassword });

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res
      .header("x-auth", token)
      .status(200)
      .send({ user_id: user._id });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//login
router.post("/api/user/login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  try {
    const user = await User.findByCredentials(username, password);
    const token = await user.generateAuthToken();
    res.send({ user_id: user._id, group: user.group, token: token });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//retrieve user by token
router.get("/api/user/me", auth_user, async (req, res) => {
  res.send(req.user);
});

//retrieve user by user id
router.get("/api/user", async (req, res) => {
  let id = req.query.id;
  try {
    let user = await User.findById(id);
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(204).send();
    }
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//logout
router.post("/api/user/logout", auth_user, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token === req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.toString());
  }
});
module.exports = router;
