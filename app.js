const express = require("express");
const app = express();
const port = 3011;
const multer = require("multer");
const fs = require("fs");
const { spawn } = require("child_process");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "tmp/");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "." + "mp4");
  },
});

function fileFilter(req, file, callback) {
  if (file.mimetype === "video/mp4") {
    callback(null, true);
  } else {
    callback(new Error("Wrong minetype"));
  } 
}

const maxSize = 10 * 1024 * 1024; // 10 Mo
 
const upload = multer({  
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter,
}).single("file");

// middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(function (req, res, next) {
  if (req.url.startsWith("/video") || req.url.startsWith("/edit")) {
    next();
  } else {
    res.status(400).json({ msg: "Bad request" });
  }
});

app.use(express.json());

// routes

// POST
app.post("/video", function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500);
    } else if (err) {
      res.status(400).json({ msg: "Bad request" });
    }

    const subprocess = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      "tmp/" + req.file.filename,
    ]);

    subprocess.stdout.on('data', function (data) {
      let totalDuration = parseFloat(data)
      res.status(200).json({ msg: "File uploaded", file: req.file.filename, duration: totalDuration*1000 }); // convert duration from s to ms
    });

    subprocess.stderr.on('data', function (data) {
      console.log('stderr: ' + data); 
    });

    subprocess.on("close", (code) => { 
      console.log(`child process exited with code ${code}`);
    });

  });
});

// POST EDITED VIDEO
app.post("/edit", (req, res) => {
  let duration = req.body.duration;
  let start = req.body.chunk.chunkStart * duration;
  let end = req.body.chunk.chunkEnd * duration;
  console.log(start,end) 
  const subprocess = spawn("ffmpeg", [
    "-ss",
    start + "ms",
    "-to",
    end + "ms",
    "-i",
    "tmp/" + req.body.fileName,
    "-c",
    "copy",
    "tmp/edited" + req.body.fileName,
  ]);

  subprocess.stdout.on('data', function (data) {
    res.status(200)
  });

  subprocess.stderr.on('data', function (data) {
    console.log('stderr: ' + data); 
  });

  subprocess.on("close", (code) => { 
    console.log(`child process exited with code ${code}`);
  });

  //res.status(500).json({msg: "Internal server error"})
});
 
// GET
app.get("/video/:id", (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoPath = "tmp/" + req.params.id;
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = { 
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

//

// DELETE
app.delete("/video/:id", (req, res) => {
  let videoPath = "tmp/" + req.params.id;
  fs.unlink(videoPath, () => {});
  videoPath = "tmp/edited" + req.params.id;
  if (fs.existsSync(videoPath)) {
    fs.unlink(videoPath, () => {});
  }
  res.status(200);
});

// server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
