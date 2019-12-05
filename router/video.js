const express = require("express");
const multer = require("multer");
const Video = require("../models/video");
const fs = require("fs");
const router = new express.Router();

//multer storage
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = "uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const extension = file.mimetype.split("/")[1];
    const filename = file.fieldname + "-" + req.query.id + "." + extension;

    cb(null, filename);
  }
});

var upload = multer({ storage: storage });

//upload video info
router.post("/video", async (req, res) => {
  var body = {
    title: req.body.title
  };
  var video = Video(body);
  try {
    await video.save();
    res.status(200).send({ id: video._id, title: video.title });
  } catch (error) {
    res.status(400).send(error);
  }
});

//patch video file info
router.patch("/video", async (req, res) => {
  let id = req.body.id;
  try {
    let video = await Video.findById(id);
    video.splashDuration = req.body.splashDuration;
    video.chapterMarks = req.body.chapterMarks;
    video.questions = req.body.questions;
    await video.save();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

//retrieve video file infor
router.get("video", async (req, res) => {
  let id = req.query.id;
  try {
    let video = await Video.findById(id);
    res.status(200).send(video);
  } catch (error) {
    res.status(400).send(error);
  }
});

//upload video splash
router.post("/video/splash", upload.single("splash"), async (req, res) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.status(200).send();
});

//retrieve video splash
router.get("/video/splash", async (req, res) => {
  var id = req.query.id;
  try {
    var files = fs.readdirSync("uploads");
    var imgPath;
    var contentType;
    for (var i in files) {
      if (files[i].substr(0, files[i].lastIndexOf(".")) === "splash-" + id) {
        imgPath = "uploads/" + files[i];
        var splitArray = files[i].split(".");
        contentType = "image/" + splitArray[splitArray.length - 1];
      }
    }
    const img = fs.readFileSync(imgPath);
    res.contentType(contentType);
    res.status(200).send(img);
  } catch (error) {
    res.status(400).send(error);
  }
});

//upload video file
router.post("/video/file", upload.single("videoFile"), async (req, res) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.status(200).send();
});

//retrieve video file
router.get("/video/file", async (req, res) => {
  var id = req.query.id;
  var files = fs.readdirSync("uploads");

  var videoPath;
  var contentType;
  for (var i in files) {
    if (files[i].substr(0, files[i].lastIndexOf(".")) === "videoFile-" + id) {
      videoPath = "uploads/" + files[i];
      var splitArray = files[i].split(".");
      contentType = "video/" + splitArray[splitArray.length - 1];
    }
  }
  if (videoPath != null) {
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": contentType
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  }
});
module.exports = router;
