import express from 'express'
import { updateLastSeen } from '../../media/controllers/activity.controller.js';
import { body, validationResult } from 'express-validator';

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

export default updateRoute