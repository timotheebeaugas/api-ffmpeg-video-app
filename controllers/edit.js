exports.editVideo = (req, res) => {
  let duration = req.body.duration;
  let start = req.body.chunk.chunkStart * duration;
  let end = req.body.chunk.chunkEnd * duration;
  let newFileName = Date.now() + "." + "mp4";

  const subprocess = require('../services/ffmpeg').subprocess(start, end, req, newFileName);

  subprocess.on("close", function (code) {
    if (code === 0) {
      res.status(200).json({ id: newFileName });
    } else res.status(500).json({ msg: "Internal server error" });
  });
};
