const { spawn } = require("child_process");

exports.subprocess = (req) =>
  spawn("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    "tmp/" + req.file.filename,
  ]);
