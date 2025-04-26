const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware')

const { query, validationResult } = require('express-validator')

const { postMedia, getImages, getVideos, deleteMedia, renameMedia } = require('../controllers/mediaController');
const limiter = require('../middlewares/rateLimiter');

router.get('/getImages', auth, [
    query('id').trim().escape().isNumeric().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();

    if (!error.isEmpty()) {
        const errArray = errors.array();
        console.log("errArray", errArray)
        return res.status(400).json({ message: errArray[0].msg })
    }
    try {
        const message = await getImages(req, res);;
        return res.status(204).json({ message: message })
    } catch (err) {
        console.log("error in getImages: ", err);
        if (!res.headersSent) {
            return res.status(500).json({ message: `error occured in getImages ${err}` })
        }
    }

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

    try {
        const message = await getVideos(req, res);
        return res.status(200).json({ message: message })
    } catch (err) {
        console.log("error in getVideos: ", err);
        return res.status(500).json({ message: `error occured in getVideos ${err}` })
    }

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
    try {
        const message = await deleteMedia(req, res);
        return res.status(204).json({ message: message })
    } catch (err) {
        console.log("error in deleteMedia: ", err);
        return res.status(500).json({ message: `error occured in deleteMedia ${err}` })
    }

})

router.put('/rename', async (req, res) => {
    try {
        const message = await renameMedia(req, res);
        console.log(message)
        return res.status(200).json({ message: message });
    } catch (err) {
        console.error("error", err);
        return res.status(500).json({ message: `error occured in updating name:  ${err} ` });
    }
})

router.put('/', async (req, res) => {
    try {
        const message = await postMedia(req, res);
        return res.status(201).json({ message: message });
    } catch (err) {
        console.error("error", err);
        return res.status(500).json({ message: `error occured in posting media:  ${err} ` });
    }
})

module.exports = router;