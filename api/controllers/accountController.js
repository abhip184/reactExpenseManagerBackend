const mongoose = require('mongoose');
const Account = require('../models/account');
const Transection = require('../models/transection');

exports.addAccount = async (req,res,next) => {

    var account = await Account.find({$and: [{accountName:req.body.accountName},{ owner:req.body.owner}]})
                               .catch(err =>{
                                    return res.status(500).json({
                                        error : err
                                    })
                                });
    
    if(account >= 1){
        return res.status(400).json({
            message:"account name exist"
        })
    }

    const acc = new Account({
        _id: new mongoose.Types.ObjectId(),
        accountName: req.body.accountName,
        currentBalance: req.body.currentBalance,
        owner: req.body.owner
    });
    
    var result = await acc.save()
                            .catch(err =>{
                                return res.status(500).json({
                                    error : err
                                })
                            });

    const transection = new Transection({
        _id: new mongoose.Types.ObjectId(),
        to: result.owner,
        amount: result.currentBalance,
        type: "income",
        toAccount: result._id,
    });

        await transection.save()
        .catch(err =>{
            return res.status(500).json({
                error : err
            })
        });;

    
    return res.status(201).json({
        message:"account created !",
        userId: result.to
    })
}


exports.getAccounts = (req,res,next) => {
    res.status(201).json({
        message:"account created"
        })
}

exports.editAccount =(req,res) =>  {
    const id = req.params.id;
    const updateOps = { }
    console.log(req.body.data)
    var newdata = JSON.parse(req.body.data)
        for(const ops of newdata)
        {
            updateOps[ops.propName] = ops.value;
        }
        console.log(updateOps)
    Account.update({_id:id},{$set : updateOps})
    .exec()
    .then(result => {
        console.log(result)
        res.status(200).json({
           message:"account updated",
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
}

exports.getAccountByUserId = (req,res,next) => {
    
    const userId = req.params.id;

        Account.find({owner:userId})
        .select("_id accountName currentBalance owner")
        .exec()
        .then(result => {
            return res.render('dashboard', {data:result})
        })
        .catch(err => {
            console.log(err);
        })

}