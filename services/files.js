const fs = require("fs");

exports.deleteFiles = setInterval(() => {
  fs.readdir("tmp/", function (err, files) {
    files.forEach(file => {
      if(Date.now() - file.split('.')[0] > 900000){ // 15mn
        fs.unlink("../tmp/" + file, () => {});
      }
    })
  })
}, 60000); // 1mn