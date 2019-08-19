const mongoose = require('mongoose');
const Account = require('../models/account');
const User = require('../models/user');
const Transection = require('../models/transection');

exports.addAccount = async (req, res, next) => {
    //checking if name of account is already taken by current user
    var account = await Account.find({
        accountName: req.body.accountName,
        owner: req.body.owner
    })
        .catch(err => {
            console.log(err);
            return res.status(500).json({
                message: message
            })
        });

    if (account.length >= 1) {
        return res.status(400).json({
            message: "account name exist"
        })
    }

    // creating account model
    const acc = new Account({
        _id: new mongoose.Types.ObjectId(),
        accountName: req.body.accountName,
        currentBalance: req.body.currentBalance,
        owner: req.body.owner
    });

    // save account
    var result = await acc.save()
        .catch(err => {
            console.log(err)
            return res.status(500).json({
                message: err
            })
        });

    // creating initial transection 
    const transection = new Transection({
        _id: new mongoose.Types.ObjectId(),
        to: result.owner,
        amount: result.currentBalance,
        type: "income",
        toAccount: result._id,
    });

    //save initial transection
    await transection.save()
        .catch(err => {
            return res.status(500).json({
                message: err
            })
        });;

    //if no error send account updated
    return res.status(201).json({
        message: "account created !",
        userId: result.to
    })
}


exports.editAccount = async (req, res) => {
    const id = req.params.id;
    const updateOps = {}
    console.log(req.body.data)
    var newdata = JSON.parse(req.body.data)
    for (const ops of newdata) {
        updateOps[ops.propName] = ops.value;
    }
    console.log(updateOps)
    var result = await Account.update({
        _id: id
    }, {
            $set: updateOps
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: err
            })
        })

    console.log(result)
    res.status(200).json({
        message: "account updated",
    })
}
exports.addFriend = async (req, res) => {
    const id = req.params.id;
    console.log(req.body.friendEmail)

    //check if friend's email exists or not
    var user = await User.find({ email: req.body.friendEmail })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

    if (user.length <= 0) {
        return res.status(200).json({
            message: "email not exists"
        })
    }

    // adding friends email to array of invites
    var result = await Account.findOneAndUpdate({
        _id: id
    }, {
            $push: {
                invites: req.body.friendEmail
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: err
            })
        })


    console.log(result)
    return res.status(200).json({
        message: "Friend Added",
    })

}
exports.getAccountByUserId = async (req, res, next) => {

    const userId = req.params.id;

    //checking if user is accessing own account or not 
    var ownAccounts = await Account.find({
        owner: userId
    }).populate('owner', 'email')
        .catch(err => {
            return res.status(500).json({
                message: err
            })
        })

    if (ownAccounts.length < 1) {
        return res.status(409).json({
            message: "unauthorize access to accounts"
        })
    }
    console.log(ownAccounts)
    const email = req.userAuth.email
    console.log("email" + email)

    if (ownAccounts[0].owner.email == email) {
        // accessing friend's account
        var friendAccounts = await Account.find({
            invites: email
        }).populate('owner')
            .catch(err => {
                return res.status(500).json({
                    message: err
                })
            })

        console.log(friendAccounts)
        console.log(ownAccounts)

        // rendering both accounts to dashboard
        return res.render('dashboard', {
            data: ownAccounts,
            friend: friendAccounts
        })

    } else {
        return res.status(409).json({
            message: "unauthorize access to accounts"
        })
    }
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