const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator')
const { createUsers, loginUser, deleteUser, updateUser, updatePassword, getUserData } = require('../controllers/userController')
const auth = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/rateLimiter')

router.post('/signup', limiter, [
    body('username').trim().escape().isAlpha().isLength({ min: 6 }).withMessage("username must be atleast 6 characters long"),
    body('email').trim().escape().isEmail().withMessage("email is not valid"),
    body('password').trim().escape().isLength({ min: 6 }).withMessage("password must atleast be 6 char long")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        message = error[0].msg
        return message
    }
    const message = await createUsers(req, res);
    return message
})

router.delete('/delete', auth, [
    query('email').trim().escape().isEmail().withMessage("email is not valid"),
    query('id').trim().escape().isNumeric().withMessage("id must be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        message = error[0].msg
        return message
    }
    const message = await deleteUser(req, res);
    return message
})

router.patch('/update', auth, limiter, [
    body('email').trim().escape().isEmail().withMessage("email is not valid"),
    body('id').trim().escape().isNumeric().withMessage("id must be a number")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array();
        message = error[0].msg
        return message
    }
    const message = await updateUser(req, res);
    return message
})

router.put('/reset-password', [
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

router.get('/login', [
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

router.get('/getUserData', [
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

module.exports = router;