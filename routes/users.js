const express = require('express');
const router = express.Router();

const { getUsers, createUsers } = require('../controllers/userController')

router.post('/', createUsers)

router.get('/', getUsers)

module.exports = router;