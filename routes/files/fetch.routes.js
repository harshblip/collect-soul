import express from 'express'
import { getSearchResults, getSuggestions } from '../../media/controllers/search.controller.js';
import { body, query, validationResult } from 'express-validator';
import { getAllFiles, getFileInfoController, getStars } from '../../media/controllers/media.controller.js';
import { getLastseen } from '../../media/controllers/activity.controller.js';

const fetchRoute = express.Router()

fetchRoute.get('/searchResults', [
    query('userId').trim().escape().isInt().withMessage("userId should be a number"),
    query('words').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("words should be in text format"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }

    const message = await getSearchResults(req, res)
    return message
})

fetchRoute.get('/getSuggestions', [
    query('userId').trim().escape().isInt().withMessage("userId should be a number"),
    query('words').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("words should be in text format"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }

    const message = await getSuggestions(req, res)
    return message
})

fetchRoute.get('/getStars', [
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

fetchRoute.get('/getFileInfo', [
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

fetchRoute.get('/getAllFiles', [
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

fetchRoute.get('/getRecentlyOpened', [
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

export default fetchRoute