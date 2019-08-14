const express = require('express')
const router = express.Router();
const transectionController = require ('../controllers/transectionController')

router.get('/:id',(req,res,next)=> {
    res.send(req.params.id)
})

router.post('/', transectionController.addTransection)

module.exports = router;