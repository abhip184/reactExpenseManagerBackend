const mongoose = require('mongoose');
const Transection = require('../models/transection');

exports.addTransection = (req,res,next) => {
    const transection = new Transection({
        _id: new mongoose.Types.ObjectId(),
        from: req.body.from,
        to: req.body.to,
        amount: req.body.from,
        type: req.body.from,
        fromAccount: req.body.from,
        toAccount: req.body.from,
    });
    transection.save()
    .then()
    .catch()
}