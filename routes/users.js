import express from 'express'
import { body, query, validationResult } from 'express-validator';
import { createUsers, deleteUser, updateUser, updatePassword } from '../users/controllers/profile.controller.js';
import { authenticateToken as auth } from '../middlewares/authMiddleware.js'
import { limiter } from '../middlewares/rateLimiter.js';

const userRoute = express.Router();

userRoute.post('/signup', limiter, [
    body('username').trim().escape().isAlpha().isLength({ min: 6 }).withMessage("username must be atleast 6 characters long"),
    body('email').trim().escape().isEmail().withMessage("email is not valid"),
    body('password').trim().escape().isLength({ min: 6 }).withMessage("password must atleast be 6 char long")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await createUsers(req, res);
    return message
})

userRoute.delete('/delete', auth, [
    query('email').trim().escape().isEmail().withMessage("email is not valid"),
    query('id').trim().escape().isNumeric().withMessage("id must be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        const message = error[0].msg
        return message
    }
    const message = await deleteUser(req, res);
    return message
})

userRoute.patch('/update', [
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

userRoute.put('/reset-password', [
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

userRoute.get('/login', [
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

userRoute.get('/getUserData', [
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

export default userRoute;