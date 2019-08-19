const express = require('express')
const router = express.Router();
const transectionController = require ('../controllers/transectionController')

router.get('/:id',transectionController.getTransectionsByAccount)
router.post('/', transectionController.addTransection)
router.get('/balance/:id', transectionController.getAccountBalance)
router.patch('/:id',transectionController.editTransection)
router.delete('/:id',transectionController.deleteTransection)


module.exports = router;