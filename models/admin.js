const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var AdminSchema = mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  name: {
    type: String
  },
  group: {
    type: String
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

AdminSchema.methods.generateAuthToken = function() {
  let admin = this;
  let access = "auth";
  let token = jwt
    .sign({ _id: admin._id.toHexString(), access }, "teamfluid")
    .toString();

  admin.tokens = admin.tokens.concat([{ access, token }]);

  return admin.save().then(() => {
    return token;
  });
};

AdminSchema.statics.findByToken = function(token) {
  let admin = this;
  let decoded;
  try {
    decoded = jwt.verify(token, "teamfluid");
  } catch (error) {
    return Promise.reject();
  }
  return Admin.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

AdminSchema.statics.findByCredentials = async (username, password) => {
  const admin = await Admin.findOne({ username });
  if (!admin) {
    throw new Error("Unable to login. No user found");
  }
  let passwordIsValid = bcrypt.compareSync(password, admin.password);
  if (!passwordIsValid) {
    throw new Error("Unable to login. Password Incorrect");
  }
  return admin;
};

var Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
