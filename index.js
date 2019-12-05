process.env.PORT = 3000;
process.env.MONGODB_URI = "mongodb://localhost:27017/VideoEditor";

var http = require("http");
var cors = require("cors");
var express = require("express");
var app = express();
var port = process.env.PORT;

require("./db/mongoose");

//router imports
const videoRouter = require("./router/video");

//middleware
app.use(cors());
app.use(express.json());
app.use(videoRouter);

var server = http.createServer(app);
server.listen(port);

console.log("http server listening on %d", port);
