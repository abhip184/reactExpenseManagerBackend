const express = require('express')
var router = express.Router();
const userController = require('../controllers/userController')
const checkSignUp = require('../middleware/check-signup')

router.post('/signup',checkSignUp,userController.signup_user)
router.post("/login",userController.login_user)


module.exports = router;