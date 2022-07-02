const express = require("express");
const app = express();
const port = 3011;

const routes = require('./middleware/routes');
const headers = require('./middleware/headers');

const video = require('./routes/video');
const download = require('./routes/download');
const edit = require('./routes/edit');

app.use(express.json());
app.use(headers);
app.use(routes);

app.use("/edit", edit);
app.use("/video", video);
app.use("/download", download); 

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
}); 

const deleteOldFiles = require('./services/files');