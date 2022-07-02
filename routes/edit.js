const express = require('express');
const router = express.Router();

const controllers = require('../controllers/edit');

router.post('/', controllers.editVideo);

module.exports = router;