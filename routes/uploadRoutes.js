const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware')

const { body, query, validationResult } = require('express-validator')

const { postMedia, getImages, getVideos, deleteMedia } = require('../controllers/mediaController');
const limiter = require('../middlewares/rateLimiter');

router.get('/getImages', limiter, auth, [
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

router.get('/getVideos', auth, [
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

router.delete('/deleteMedia', auth, [
    query('username').trim().escape().isAlpha().withMessage("username should be in text format"),
    query('fileName').trim().escape().matches(/^[a-zA-Z0-9_.-]+$/).withMessage("fileName should be in text format"),
    query('imageId').trim().escape().isInt().withMessage("imageId should be a number"),
    query('id').trim().escape().isInt().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        // const errArray = errors.array();
        return res.status(400).json({ message: errors[0].msg })
    }

    await deleteMedia(req, res);

})

router.post('/', auth, [
    body('id').trim().escape().isNumeric().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();

    if (!error.isEmpty()) {
        const errArray = errors.array();
        return res.status(400).json({ message: errArray[0].msg })
    }

    postMedia(req, res);
})

module.exports = router;