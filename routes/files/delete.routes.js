import express from 'express'
import { query, validationResult } from 'express-validator';
import { deleteMedia } from '../../media/controllers/media.controller.js';

const deleteRoute = express.Router()

deleteRoute.delete('/deleteMedia', [
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

export default deleteRoute