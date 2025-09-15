import express from 'express'
import { updateLastSeen } from '../../media/controllers/activity.controller.js';
import { body, validationResult } from 'express-validator';
import { trashMedia } from '../../media/controllers/media.controller.js';
import { createFolder } from '../../media/controllers/folder.controller.js';
import { lockFile, unlockFile } from '../../media/controllers/lock.controller.js';

const updateRoute = express.Router()

updateRoute.post('/updateLastOpened', [
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

updateRoute.post('/createFolder', [
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

updateRoute.post('/trashMedia', trashMedia)

updateRoute.post('/lockfile', [
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

updateRoute.post('/unlockfile', [
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


export default updateRoute