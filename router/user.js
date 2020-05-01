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
    role: req.body.role,
    group: req.body.group,
    team: req.body.team,
    gender: req.body.gender,
    position: req.body.position,
  };
  let hashedPassword = bcrypt.hashSync(password, 8);
  let user = User({ ...body, password: hashedPassword });

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.header("x-auth", token).status(200).send({ user_id: user._id });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//update user
router.patch("/api/user/update", async (req, res) => {
  let password = req.body.password;
  let body = {
    username: req.body.username,
    name: req.body.name,
    role: req.body.role,
    group: req.body.group,
    team: req.body.team,
    gender: req.body.gender,
    position: req.body.position,
  };
  try {
    let updateObj = null;
    if (password != null) {
      let hashedPassword = bcrypt.hashSync(password, 8);
      updateObj = { ...body, password: hashedPassword };
    } else {
      updateObj = { ...body };
    }
    await User.findOneAndUpdate({ username: body.username }, updateObj);

    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

//update profile
router.patch("/api/user/profile", async (req, res) => {
  let username = req.body.username;
  let gender = req.body.gender;
  let name = req.body.name;
  let password = req.body.password;
  let oldPassword = req.body.oldPassword;

  try {
    let user = await User.findOne({ username });
    let body = {
      gender,
      name,
    };
    if (password && oldPassword) {
      let passwordIsValid = bcrypt.compareSync(oldPassword, user.password);
      if (!passwordIsValid) {
        throw new Error("Incorrect old Password!");
      }
      let hashedPassword = bcrypt.hashSync(password, 8);
      body = { ...body, password: hashedPassword };
    }
    await User.findOneAndUpdate({ username }, body);
    res.status(200).send();
  } catch (error) {
    res.send({ error: error.toString() });
  }
});

//delete user
router.delete("/api/user/delete", async (req, res) => {
  let username = req.query.username;
  try {
    await User.findOneAndDelete({ username });
    res.status(200).send();
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
    res.send({
      user_id: user._id,
      name: user.name,
      role: user.role,
      group: user.group,
      token: token,
    });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//retrieve user by token
router.get("/api/user/me", auth_user, async (req, res) => {
  res.send(req.user);
});

//retrieve userList

router.get("/api/user/search", async (req, res) => {
  try {
    let users = await User.find({}, [
      "username",
      "name",
      "role",
      "group",
      "team",
      "gender",
      "position",
    ]);
    res.status(200).send(users);
  } catch (error) {}
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
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token === req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.toString());
  }
});
module.exports = router;
