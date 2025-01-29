const express = require('express');
const router = express.Router();

const { postMedia, getImages, deleteMedia } = require('../controllers/mediaController')

router.get('/getImages', getImages)

router.delete('/deleteMedia', deleteMedia)

router.post('/', postMedia)

module.exports = router;