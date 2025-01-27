const express = require('express');
const router = express.Router();

const { getUsers, createUsers, loginUser } = require('../controllers/userController')

router.post('/signup', createUsers)

router.get('/login', loginUser)
router.get('/', getUsers)

module.exports = router;