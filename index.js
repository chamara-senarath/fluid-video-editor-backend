process.env.PORT = 3000;
// process.env.MONGODB_URI = "mongodb://localhost:27017/VideoEditor";
process.env.MONGODB_URI = process.env.container
  ? "mongodb://mongo:27017/VideoEditor"
  : "mongodb://localhost:27017/VideoEditor";

var http = require("http");
var cors = require("cors");
var express = require("express");
var app = express();
var port = process.env.PORT;

require("./db/mongoose");

//router imports
const videoRouter = require("./router/video");
const userRouter = require("./router/user");
// const adminRouter = require("./router/admin");
const insightRouter = require("./router/insight");
const commentRouter = require("./router/comment");
const ratingRouter = require("./router/rating");

//middleware
app.use(cors());
app.use(express.json());
app.use(videoRouter);
app.use(userRouter);
// app.use(adminRouter);
app.use(insightRouter);
app.use(commentRouter);
app.use(ratingRouter);

var server = http.createServer(app);
server.listen(port);

console.log("http server listening on %d", port);
console.log();
