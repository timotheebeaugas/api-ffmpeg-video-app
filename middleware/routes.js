module.exports = (req, res, next) => {
  if (
    req.url.startsWith("/video") ||
    req.url.startsWith("/edit") ||
    req.url.startsWith("/download")
  ) {
    next();
  } else {
    res.status(400).json({ msg: "Bad request" });
  }
};
