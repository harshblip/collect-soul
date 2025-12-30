import express from 'express'
import { updateLastSeen } from '../../media/controllers/activity.controller.js';
import { body, validationResult } from 'express-validator';
import { enableDelete, recoverMedia, renameMedia, starFile, trashMedia } from '../../media/controllers/media.controller.js';
import { addFilestoFolder, createFolder } from '../../media/controllers/folder.controller.js';
import { lockFile, unlockFile } from '../../media/controllers/lock.controller.js';
import uploadRoute from './upload.routes.js';
import { addFilestoFolderFn } from '../../media/services/folder.service.js';

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

uploadRoute.post('/recoverMedia', recoverMedia)

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

updateRoute.post('/starFile', [
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

updateRoute.post('/addFilestoFolder', [
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

updateRoute.put('/rename', [
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

updateRoute.post('/enableAutoDelete', [
    body('userId').trim().escape().isInt().withMessage("userId should be a number")
], async (req, res) => {
    const error = validationResult(req);
    const errors = error.array();
    console.log(errors)
    if (!error.isEmpty()) {
        return res.status(400).json({ message: errors[0].msg })
    }
    const message = await enableDelete(req, res);
    console.log("enableDelete", message)
    return message;
})


export default updateRoute