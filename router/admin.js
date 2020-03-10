const express = require("express");
const Admin = require("../models/admin");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const auth_admin = require("../middleware/auth_admin");

//register
router.post("/api/admin", async (req, res) => {
  let password = req.body.password;
  let body = {
    username: req.body.username,
    name: req.body.name,
    group: req.body.group
  };
  let hashedPassword = bcrypt.hashSync(password, 8);
  let admin = Admin({ ...body, password: hashedPassword });

  try {
    await admin.save();
    const token = await admin.generateAuthToken();
    res
      .header("x-auth", token)
      .status(200)
      .send({ admin_id: admin._id });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//login
router.post("/api/admin/login", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  try {
    const admin = await Admin.findByCredentials(username, password);
    const token = await admin.generateAuthToken();
    res.send({
      admin_id: admin._id,
      group: admin.group,
      name: admin.name,
      avatar: null,
      token: token
    });
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//retrieve user by token
router.get("/api/admin/me", auth_admin, async (req, res) => {
  res.send(req.admin);
});

//retrieve user by user id
router.get("/api/admin", async (req, res) => {
  let id = req.query.id;
  try {
    let admin = await Admin.findById(id);
    if (admin) {
      res.status(200).send(admin);
    } else {
      res.status(204).send();
    }
  } catch (error) {
    res.status(400).send(error.toString());
  }
});

//logout
router.post("/api/admin/logout", auth_admin, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter(token => {
      return token.token === req.token;
    });
    await req.admin.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error.toString());
  }
});
module.exports = router;
