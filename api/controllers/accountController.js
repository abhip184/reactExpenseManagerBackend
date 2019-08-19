const mongoose = require('mongoose');
const Account = require('../models/account');
const Transection = require('../models/transection');

exports.addAccount = async (req, res, next) => {

    var account = await Account.find({
            accountName: req.body.accountName,
            owner: req.body.owner
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                error: err
            })
        });

    if (account.length >= 1) {
        return res.status(400).json({
            message: "account name exist"
        })
    }

    const acc = new Account({
        _id: new mongoose.Types.ObjectId(),
        accountName: req.body.accountName,
        currentBalance: req.body.currentBalance,
        owner: req.body.owner
    });

    var result = await acc.save()
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                error: err
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
        .catch(err => {
            return res.status(500).json({
                error: err
            })
        });;


    return res.status(201).json({
        message: "account created !",
        userId: result.to
    })
}


exports.getAccount = async (req, res, next) => {

    const account = await Account.find()
    const id = req.params.id;
    res.status(201).json({
        message: account,
    })
}

exports.editAccount = (req, res) => {
    const id = req.params.id;
    const updateOps = {}
    console.log(req.body.data)
    var newdata = JSON.parse(req.body.data)
    for (const ops of newdata) {
        updateOps[ops.propName] = ops.value;
    }
    console.log(updateOps)
    Account.update({
            _id: id
        }, {
            $set: updateOps
        })
        .exec()
        .then(result => {
            console.log(result)
            res.status(200).json({
                message: "account updated",
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}
exports.addFriend = (req, res) => {
    const id = req.params.id;
    console.log(req.body.friendEmail)
    Account.findOneAndUpdate({
            _id: id
        }, {
            $push: {
                invites: req.body.friendEmail
            }
        })
        .exec()
        .then(result => {
            console.log(result)
            res.status(200).json({
                message: "Friend Added",
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: err
            })
        })
}
exports.getAccountByUserId = async (req, res, next) => {

    const userId = req.params.id;

    var ownAccounts = await Account.find({
            owner: userId
        }).populate('owner', 'email')
        .catch(err => {
            console.log(err);
        })
        if(ownAccounts.length < 1)
        {
            res.status(409).json({
                message: "unauthorize access to accounts"
            })
        }
    console.log(ownAccounts)
    const email = req.userAuth.email
    console.log("email" + email)
    if (ownAccounts[0].owner.email == email) {

        var friendAccounts = await Account.find({
                invites: email
            })
            .populate('owner')
            .catch(err => {
                console.log(err);
            })
        console.log(friendAccounts)
        console.log(ownAccounts)
        return res.render('dashboard', {
            data: ownAccounts,
            friend: friendAccounts
        })

    } else {
        res.status(409).json({
            message: "unauthorize access to accounts"
        })
    }




    // Account.find({owner:userId})
    // .select("_id accountName currentBalance owner")
    // .exec()
    // .then(result => {
    //     return res.render('dashboard', {data:result})
    // })
    // .catch(err => {
    //     console.log(err);
    // })

}

exports.deleteAccount = (req, res, next) => {

    const accountId = req.params.id;

    Account.remove({
            _id: accountId
        })
        .then(result => {

            return res.status(200).json({
                message: "account removed"
            })
        })
        .catch(err => {
            return res.status(500).json({
                message: err
            })
        })

}