import express from 'express'
import { getSearchResults, getSuggestions } from '../../media/controllers/search.controller.js';
import { body, query, validationResult } from 'express-validator';
import { getFileInfoController, getStars } from '../../media/controllers/media.controller.js';

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

export default fetchRoute