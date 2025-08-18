import express from 'express'
import { authenticateToken as auth } from '../middlewares/authMiddleware.js';
import { body, query, validationResult } from 'express-validator';
import { limiter } from '../middlewares/rateLimiter.js';
import { addFilestoFolder } from '../media/controllers/folder.controller.js';
import { getSuggestions } from '../media/controllers/search.controller.js';
import { trashMedia, recoverMedia, postMedia } from '../media/controllers/media.controller.js'

const router = express.Router()

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

router.put('/rename', [
    body('newFileName').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("filename should be in text format")
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
    body('name').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("folder name should be in text format"),
    body('description').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("folder description should be in text format"),
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

router.post('/addFilestoFolder', [
    body('folderId').trim().escape().isInt().withMessage("folderId should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await addFilestoFolder(req, res);
    return message
})

router.get('/getFolders', [
    query('id').trim().escape().isInt().withMessage("id should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await getFolders(req, res)
    return message
})

router.get('/getAllFiles', [
    query('user_id').trim().escape().isInt().withMessage("user_id should be a number"),
    query('page').trim().escape().isInt().withMessage("page should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await getAllFiles(req, res);
    return message
})

router.post('/trashMedia', trashMedia)

router.post('/recoverMedia', recoverMedia)

router.get('/folderItems', [
    query('userId').trim().escape().isInt().withMessage("userId should be a number"),
    query('folderId').trim().escape().isInt().withMessage("folderId should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await folderItems(req, res)
    return message
})

router.post('/starFile', [
    body('userId').trim().escape().isInt().withMessage("userId should be a number"),
    body('id').trim().escape().isInt().withMessage("id should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await starFile(req, res)
    return message
})

router.get('/getStars', [
    query('userId').trim().escape().isInt().withMessage("userId should be a number"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await getStars(req, res)
    return message
})

router.get('/getFileInfo', [
    query('user_id').trim().escape().isInt().withMessage("user_id should be a number"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await getFileInfoController(req, res)
    return message
})

router.post('/lockfile', [
    body('password').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("password should be in text format"),
    body('fileId').trim().escape().isInt().withMessage("fileId should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }

    const message = await lockFile(req, res)
    return message
})

router.post('/lockfolder', [
    body('password').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("password should be in text format"),
    body('folderId').trim().escape().isInt().withMessage("folderId should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }

    const message = await lockFolder(req, res)
    return message
})

router.post('/unlockfile', [
    body('fileId').trim().escape().isInt().withMessage("fileId should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }

    const message = await unlockFile(req, res)
    return message
})

router.post('/unlockfolder', [
    body('folderId').trim().escape().isInt().withMessage("folderId should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }

    const message = await unlockFolder(req, res)
    return message
})

router.post('/updateLastOpened', [
    body('type').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("password should be in text format"),
    body('fileId').trim().escape().isInt().withMessage("folderId should be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }

    const message = await updateLastSeen(req, res)
    return message
})

router.get('/getRecentlyOpened', [
    query('userId').trim().escape().isInt().withMessage("userId should be a number"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await getLastseen(req, res)
    return message
})

router.get('/getStarFiles', [
    query('userId').trim().escape().isInt().withMessage("userId should be a number"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    // const message 
})



export default router