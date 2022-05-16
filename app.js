const express = require("express");
const app = express();
const port = 3011;
const multer  = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'tmp/')
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '.' + 'mp4')
  }
})

function fileFilter (req, file, callback) {
  if(file.mimetype === 'video/mp4'){
    callback(null, true)
  }else{
    callback(new Error('Wrong minetype')) 
  }
}

const maxSize = 10 * 1024 * 1024; // 10 Mo

const upload = multer({ storage: storage, limits: { fileSize: maxSize }, fileFilter }).single('file')


// middleware

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(function (req, res, next) {
  if(req.url.startsWith('/video')){
    next();
  }else{
    res.status(400).json({msg: 'Bad request'});
  }
});


// routes
app.post('/video', function (req, res) {
  upload(req, res, function (err) { 
    if (err instanceof multer.MulterError) { 
      res.status(500); 
    } else if (err) {
      res.status(400).json({msg: 'Bad request'});
    }
    res.status(200).json({msg: 'File uploaded', file: req.file.filename}); 
  }) 
})
 
app.get("/video/:id", (req, res) => {
  const range = req.headers.range;
  if (!range) {
      res.status(400).send("Requires Range header");
  }
  const videoPath = 'tmp/' + req.params.id;
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

app.delete('/video/:id', (req,res) => {
  const videoPath = 'tmp/' + req.params.id;
  fs.unlink(videoPath, () => {})
  res.status(200)
});

// server  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});   