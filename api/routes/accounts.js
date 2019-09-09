const express = require('express')
const router = express.Router();
const accountController = require ('../controllers/accountController')
const checkAuth = require('../middleware/check-auth')
const checkAccount = require('../middleware/check-account');

router.get('/',checkAuth,accountController.getAccountsByUserId)
router.get('/email/:email',checkAuth,accountController.getAccountByEmail)
router.get('/:id',checkAuth,accountController.getAccountByAccountId)
router.post("/",checkAuth,checkAccount.checkDuplicateAccountName,accountController.addAccount)
router.patch("/addFriend/:id",checkAccount.checkAddfriendEmail, accountController.addFriend)
router.patch("/:id",accountController.editAccount)
router.delete("/:id",checkAuth,accountController.deleteAccount)

module.exports = router;
