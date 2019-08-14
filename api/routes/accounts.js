const express = require('express')
const router = express.Router();
const accountController = require ('../controllers/accountController')
const checkAuth = require('../middleware/check-auth')


router.get('/:id',accountController.getAccounts)
router.get('/user/:id',checkAuth,accountController.getAccountByUserId)
router.post("/",accountController.addAccount)
router.patch("/:id",checkAuth,accountController.editAccount)


module.exports = router;
