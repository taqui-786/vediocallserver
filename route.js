const express = require('express');
const router = express.Router()
const {Registeruser,loginUser, allUser} = require('./controller/userController');
router.post('/register',Registeruser)
router.post('/login',loginUser)
router.get('/users/:id',allUser)
module.exports = router;

