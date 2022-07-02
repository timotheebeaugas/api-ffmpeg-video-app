const { spawn } = require("child_process");

exports.subprocess = (start, end, req, newFileName) => spawn("ffmpeg", [
  "-ss",
  start + "ms",
  "-to",
  end + "ms",
  "-i",
  "tmp/" + req.body.fileName,
  "-c",
  "copy",
  "tmp/" + newFileName,
]);
