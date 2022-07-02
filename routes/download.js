const express = require('express');
const router = express.Router();

const controllers = require('../controllers/download');

router.get('/:id', controllers.downloadEditedVideo);

module.exports = router;