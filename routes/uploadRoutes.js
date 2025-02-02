const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware')

const { body, query, validationResult } = require('express-validator')

const { postMedia, getImages, getVideos, deleteMedia } = require('../controllers/mediaController')

router.get('/getImages', auth, [
    query('id').trim().escape().isNumeric().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();

    if (!error.isEmpty()) {
        const errArray = errors.array();
        return res.status(400).json({ message: errArray[0].msg })
    }

    await getImages(req, res);

})

router.get('/getVideos', [
    query('id').trim().escape().isNumeric().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();

    if (!error.isEmpty()) {
        const errArray = errors.array();
        return res.status(400).json({ message: errArray[0].msg })
    }

    await getVideos(req, res);

})

router.delete('/deleteMedia', [
    query('username').trim().escape().isAlpha().withMessage("username should be text format"),
    query('fileName').trim().escape().isAlpha().withMessage("fileName should be text format"),
    query('id').trim().escape().isNumeric().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();

    if (!error.isEmpty()) {
        const errArray = errors.array();
        return res.status(400).json({ message: errArray[0].msg })
    }

    await deleteMedia(req, res);

})

router.post('/', auth, postMedia)

module.exports = router;