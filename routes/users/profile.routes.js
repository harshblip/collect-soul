import express from 'express'
import { body, query, validationResult } from 'express-validator';
import { authenticateToken as auth } from "../../middlewares/authMiddleware";
import { limiter } from "../../middlewares/rateLimiter";

const profileRoute = express.Router();

profileRoute.patch('/update', [
    body('username').trim().escape().matches(/^[a-zA-Z0-9_. -]+$/).withMessage("username should be in text format"),
    body('email').trim().escape().isEmail().withMessage("email is not valid"),
    body('id').trim().escape().isNumeric().withMessage("id must be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await updateUser(req, res);
    return message
})

profileRoute.put('/reset-password', [
    body('email').trim().escape().isEmail().withMessage("email is not valid"),
    body('password').trim().escape().isLength({ min: 6 }).withMessage("password must atleast be 6 char long")
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return res.status(400).json({ message })
    }
    const { message } = await updatePassword(req, res)
    return message
})

profileRoute.get('/login', [
    query('email').trim().escape().isEmail().withMessage("email is not valid"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return res.status(400).json({ message })
    }
    const { message } = await loginUser(req, res);
    return message
})

profileRoute.get('/getUserData', [
    query('id').trim().escape().isNumeric().withMessage("id must be a number")
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return res.status(400).json({ message })
    }
    const message = await getUserData(req, res)
    return message;
})

export default profileRoute;