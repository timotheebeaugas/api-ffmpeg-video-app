const express = require('express');
const router = express.Router();

const controllers = require('../controllers/video');

router.post('/', controllers.postVideo);
router.get('/:id', controllers.getVideo);

module.exports = router;