const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware')

const { body, query, validationResult } = require('express-validator')

const { postMedia, getImages, getVideos, deleteMedia, renameMedia, createFolder, getFolders, getAllFiles, trashMedia, recoverMedia } = require('../controllers/mediaController');
const limiter = require('../middlewares/rateLimiter');

router.get('/getImages', auth, [
    query('id').trim().escape().isNumeric().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await getImages(req, res);
    console.log(message)
    return message
})

router.get('/getVideos', auth, [
    query('id').trim().escape().isNumeric().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await getVideos(req, res);
    return message
})

router.delete('/deleteMedia', auth, [
    query('username').trim().escape().isAlpha().withMessage("username should be in text format"),
    query('id').trim().escape().isInt().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await deleteMedia(req, res);
    return message
})

router.put('/rename', auth, [
    query('newFileName').trim().escape().matches(/^[a-zA-Z0-9_.-]+$/).withMessage("filename should be in text format")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await renameMedia(req, res);
    console.log(message)
    return message;
})

router.post('/createFolder', [
    body('name').trim().escape().matches(/^[a-zA-Z0-9_.-]+$/).withMessage("folder name should be in text format"),
    body('description').trim().escape().matches(/^[a-zA-Z0-9_.-]+$/).withMessage("folder description should be in text format"),
    body('id').trim().escape().isInt().withMessage("id should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await createFolder(req, res);
    return message
})

router.get('/getFolders', [
    query('id').trim().escape().isInt().withMessage("id should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        message = error[0].msg
        return message
    }
    const message = await getFolders(req, res)
    return message
})

router.get('/getAllFiles', auth, [
    query('email').trim().escape().isEmail().withMessage("email is not valid")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        message = error[0].msg
        return message
    }
    const message = await getAllFiles(req, res);
    return message
})

router.post('/trashMedia', trashMedia)

router.post('/recoverMedia', recoverMedia)

router.post('/', postMedia)

module.exports = router;