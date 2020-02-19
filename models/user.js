const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var UserSchema = mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  name: {
    type: String
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  location: {
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

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = "auth";
  let token = jwt
    .sign({ _id: user._id.toHexString(), access }, "teamfluid")
    .toString();

  user.tokens = user.tokens.concat([{ access, token }]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.statics.findByToken = function(token) {
  let user = this;
  let decoded;
  try {
    decoded = jwt.verify(token, "teamfluid");
  } catch (error) {
    return Promise.reject();
  }
  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

UserSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Unable to login. No user found");
  }
  let passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    throw new Error("Unable to login. Password Incorrect");
  }
  return user;
};

var User = mongoose.model("User", UserSchema);

module.exports = User;
