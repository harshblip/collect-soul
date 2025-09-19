import express from 'express'
import { body, validationResult } from 'express-validator';
import { lockFile, lockFolder, unlockFile, unlockFolder } from '../../media/controllers/lock.controller.js';

const lockRoute = express.Router()

lockRoute.post('lockfolder', [
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

lockRoute.post('/unlockfolder', [
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

lockRoute.post('/lockfile', [
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

lockRoute.post('/unlockfile', [
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

export default lockRoute