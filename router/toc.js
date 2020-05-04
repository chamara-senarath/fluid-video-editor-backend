const express = require("express");
const TOC = require("../models/toc");
const router = new express.Router();

//post
router.post("/api/toc/new", async (req, res) => {
  let nodes = req.body.nodes;
  try {
    let existTOC = await TOC.findOne();
    if (!existTOC) {
      existTOC = await TOC({ nodes });
    } else {
      existTOC.nodes = nodes;
    }
    existTOC.save();
    res.send();
  } catch (error) {
    console.log(error);
    res.status(400).send();
  }
});

//get
router.get("/api/toc", async (req, res) => {
  try {
    let toc = await TOC.findOne();
    res.send({ toc });
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
