const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator')

const { createUsers, loginUser, deleteUser, updateUser } = require('../controllers/userController')

router.post('/signup', [
    body('username').trim().isAlpha().isLength({ min: 6 }).withMessage("username must be atleast 6 characters long"),
    body('email').trim().isEmail().withMessage("email is not valid"),
    body('password').trim().isLength({ min: 6 }).withMessage("password must atleast be 6 char long")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errArray = errors.array();
        return res.status(400).json({ message: errArray[0].msg })
    }
    await createUsers(req, res);
})

router.delete('/delete', deleteUser)

router.patch('/update', updateUser)

router.get('/login', loginUser)

module.exports = router;