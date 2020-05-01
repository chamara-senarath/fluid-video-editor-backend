const mongoose = require("mongoose");

var TOCSchema = mongoose.Schema({
  TOC: {
    type: Object,
  },
});

var TOC = mongoose.model("TOC", TOCSchema);

module.exports = TOC;
