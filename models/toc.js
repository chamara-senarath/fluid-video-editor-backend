const mongoose = require("mongoose");

var TOCSchema = mongoose.Schema({
  data: {
    type: Object,
  },
  nodes: {
    type: Array,
  },
});

var TOC = mongoose.model("TOC", TOCSchema);

module.exports = TOC;
