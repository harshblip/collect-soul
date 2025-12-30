import { getSuggestionsFn, getSearchResultsFn } from "../services/search.service.js";

export const getSuggestions = async (req, res) => {
    const { words, userId, type, starred, locked, date } = req.query;
    console.log(req.query)
    try {
        const message = await getSuggestionsFn(words, userId, type, starred, locked, date)
        return res.status(200).json({ message: message.rows })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const getSearchResults = async (req, res) => {
    const { words, userId, type, starred, locked, date } = req.query;
    try {
        const message = await getSearchResultsFn(words, userId, type, starred, locked, date)
        return res.status(200).json({ message: message.rows })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}