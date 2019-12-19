const mongoose = require("mongoose");

var UserSchema = mongoose.Schema({
  name: {
    type: String
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  location:{
    type:String
  }
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
