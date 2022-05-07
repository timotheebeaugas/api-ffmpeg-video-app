const express = require("express");
const app = express();
const port = 3011;
const multer  = require('multer')


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

// routes

app.post('/video', function (req, res) {
  upload(req, res, function (err) { 
    if (err instanceof multer.MulterError) { 
      res.status(500); 
    } else if (err) {
      res.status(400).json({msg: 'Bad request'});;
    }
    res.status(200).json({msg: 'File uploaded', file: req.file.filename}); 
  }) 
})
 
app.get("/video/:id", (req, res) => {
  res.json("request");
});

// server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});