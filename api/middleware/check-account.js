const mongoose = require("mongoose");
const Account = require("../models/account");
const User = require("../models/user");
const Transection = require("../models/transection");

checkDuplicateAccountName = async (req,res,next) => {
     //checking if name of account is already taken by current user
  var account = await Account.find({
    accountName: req.body.accountName,
    owner: req.userAuth.id
  }).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  if (account.length >= 1) {
    return res.status(400).json({
      errorInfo: "Bad Request",
      message: "Account name exists"
    });
  }
  else{
      next()
  }
}

checkAddfriendEmail = async (req,res,next) => {
  //check if friend's email exists or not
  var user = await User.find({ email: req.body.friendEmail }).catch(err => {
    console.log(err);
    res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  if (user.length <= 0) {
    return res.status(400).json({
      errorInfo: "Bad request",
      message: "Email not exists"
    });
  }
  else{
    next()
  }
}
module.exports = {
    checkDuplicateAccountName,
    checkAddfriendEmail
}
