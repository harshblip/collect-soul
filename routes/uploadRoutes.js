const express = require('express');
const router = express.Router();

const { postMedia } = require('../controllers/uploadController')

router.post('/', postMedia)

module.exports = router;