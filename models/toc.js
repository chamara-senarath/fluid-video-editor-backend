const mongoose = require("mongoose");

var TOCSchema = mongoose.Schema({
  nodes: {
    type: Object,
  },
});

var TOC = mongoose.model("TOC", TOCSchema);

module.exports = TOC;
