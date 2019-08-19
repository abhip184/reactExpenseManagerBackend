const mongoose = require('mongoose');
const Transection = require('../models/transection');
const Account = require('../models/account')

exports.editTransection =(req,res) =>  {
    const id = req.params.id;
    var newdata = JSON.parse(req.body.data)
    console.log(newdata)
    const updateOps = {}
        for(const ops of newdata)
        {
            updateOps[ops.propName] = ops.value;
        }
        console.log(updateOps)  
    Transection.update({_id:id},{$set : updateOps})
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
exports.addTransection = async (req,res,next) => {
    var transection
    // if(req.body.currentBalance < req.body.amount)
    // {
    //     res.status(413).json({
    //         message:"inefficent balance"
    //     })
    // }
    if(req.body.type == "income")
    {
        transection = new Transection({
            _id: new mongoose.Types.ObjectId(),
            to: req.cookies.userId,
            amount: req.body.amount,
            type: req.body.type,
            category:req.body.category,
            toAccount: req.body.accountId,
        });
        console.log("income ..........................................")

    }
    else if(req.body.type == "expense")
    {
         transection = new Transection({
            _id: new mongoose.Types.ObjectId(),
            from: req.cookies.userId,
            amount: req.body.amount,
            type: req.body.type,
            category:req.body.category,
            fromAccount: req.body.accountId,
        });
        console.log("expensing ..........................................")

    }
    else{
         transection = new Transection({
            _id: new mongoose.Types.ObjectId(),
            to: req.body.to,
            from: req.body.from,
            amount: req.body.amount,
            type: req.body.type,
            category:req.body.category,
            toAccount: req.body.toAccount,
            fromAccount: req.body.fromAccount,

        });
        console.log(req.body.fromAccount)
    }
  
   var result = await transection.save().catch(err=>{
       res.status(500).json({
           error:err,
           message:"error occured while saving transection"
       })
   })

   console.log(result)
}

exports.getTransectionsByAccount = async (req,res,next)=>{
    var id = req.params.id;
    console.log(id)
var account = await Account.findOne({_id:id}).populate('owner')
var accountsForOwner = await Account.find({owner:req.cookies.userId})

     Transection.find( {$or:[
                            {toAccount:new mongoose.Types.ObjectId(id)},
                            {fromAccount:new mongoose.Types.ObjectId(id)}
                        ]
                    },
                ).sort({'atDate':-1}).populate('toAccount')
                .populate('fromAccount')
                .populate('to')
                .populate('from')
                .exec()
                .then(transections=>{
                    var owner = false;
                    if(account.owner.email == req.cookies.email)
                    {
                        owner = true
                    }
                    console.log("owner")
                    console.log(owner)
                    console.log(transections)
                    res.render('viewAccount',{data:transections,
                        owner:owner,
                        ownerInfo:account,
                        accountId:id,
                        currentUser:req.cookies.userId,
                        accountsForOwner:accountsForOwner})
                })
                .catch(err=>{
          console.log(err);
         return res.status(500).json({
              error: err
          })
      })

}

exports.getAccountBalance = async (req,res,next) => {
    const id = req.params.id
    var incomeAmount,expenseAmount;

    const totalIncome = await Transection.aggregate( [
        { $match : {toAccount:new mongoose.Types.ObjectId(id)},},
    { $group : { _id : {income:"$toAccount"} , subtotal : { $sum: "$amount"} } },
      ]).catch(err=>{
          console.log(err);
         return res.status(500).json({
              error: err
          })
      })

      const totalExpense = await Transection.aggregate( [
        { $match : {fromAccount:new mongoose.Types.ObjectId(id)},},
    { $group : { _id : {income:"$fromAccount"} , subtotal : { $sum: "$amount"} } },
      ]).catch(err=>{
          console.log(err);
         return res.status(500).json({
              error: err
          })
      })

      if(totalIncome.length <= 0)
      {
          incomeAmount = 0;
      }
      else{
        incomeAmount = totalIncome[0].subtotal
      }
      if(totalExpense.length <= 0)
      {
          expenseAmount = 0
      }
      else{
        expenseAmount = totalExpense[0].subtotal
      }


console.log("income "+incomeAmount)
console.log("expense "+expenseAmount)
console.log("expense "+expenseAmount)
const currentBalance = incomeAmount - expenseAmount;
console.log(currentBalance+"expenseAmount")

var updatedBalance = await Account.findOneAndUpdate({_id:id},{$set:{currentBalance:currentBalance}},{new: true})
.catch(err=>{
    console.log(err)
    return res.status(500).json({
        message:"error occured to update balance",
        error:err
    })
})
console.log("updatedBalance")
// console.log(updatedBalance)

return res.status(200).json({
    balance:currentBalance,
    accountId:id
})

}

exports.deleteTransection = async (req,res,next) => {
    const id = req.params.id;
const result = await Transection.remove({_id:id}).catch(err =>{
    return res.status(500).json({
        error:err,
        message:"error occurred while deleting transection"
    })
})
return res.status(200).json({
    result:result,
    message:"Transection deleted"
})
}