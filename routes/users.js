const express = require('express');
const router = express.Router();

const { getUsers, createUsers, loginUser, deleteUser, updateUser } = require('../controllers/userController')

router.post('/signup', createUsers)

router.delete('/delete', deleteUser)

router.patch('/update', updateUser)

router.get('/login', loginUser)

module.exports = router;