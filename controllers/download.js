exports.downloadEditedVideo = (req, res) => {
  res.download("../tmp/" + req.params.id);
};
