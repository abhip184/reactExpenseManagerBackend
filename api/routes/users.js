const express = require('express')
var router = express.Router();
const checkAuth = require('../middleware/check-auth')
const userController = require('../controllers/userController')

router.post('/signup',userController.signup_user)
router.post("/login",userController.login_user)
router.get("/logout",userController.logout)
router.delete("/:id", checkAuth, userController.delete_user)


module.exports = router;