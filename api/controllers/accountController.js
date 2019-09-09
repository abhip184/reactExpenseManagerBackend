const mongoose = require("mongoose");
const Account = require("../models/account");
const User = require("../models/user");
const Transection = require("../models/transection");

/**
 * @description add user account
 * @requires Account for making user account
 * @requires Transection for making initial transection
 * @returns {json} Created Account with success message
 * @borrows duplicate account name check from check-account.js
 * @summary handle post method api request on /accounts url
 * @async
 */
const addAccount = async (req, res) => {
  // creating account model
  const acc = new Account({
    _id: new mongoose.Types.ObjectId(),
    accountName: req.body.accountName,
    currentBalance: req.body.currentBalance,
    owner: req.userAuth.id
  });

  // save account
  var result = await acc.save().catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  // creating initial transection
  const transection = new Transection({
    _id: new mongoose.Types.ObjectId(),
    to: result.owner,
    amount: result.currentBalance,
    type: "income",
    toAccount: result._id
  });

  //save initial transection
  await transection.save().catch(err => {
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  //if no error send account updated
  return res.status(201).json({
    message: "Account created !",
    createdAcccount: {
      _id: result._id,
      accountName: result.accountName,
      currentBalance: result.currentBalance,
      invites: result.invites,
      owner: result.owner
    }
  });
};

/**
 * @description Edit account name
 * @requires Account model for update that model
 * @returns {json} on success - Account updated message only
 * @returns {json} on fail - server error
 * @borrows req.params.id as id from url param
 * @summary handle PATCH method api request on /accounts url
 * @async
 */
const editAccount = async (req, res) => {
  const id = req.params.id;
  const updateOps = {};
  console.log(req.body);

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  console.log(updateOps);
  var result = await Account.update({ _id: id }, { $set: updateOps }).catch(
    err => {
      console.log(err);
      res.status(500).json({
        error: err,
        message: "Server Error"
      });
    }
  );

  console.log(result);
  res.status(200).json({
    message: "account updated"
  });
};

/**
 * @description add friend email to account model
 * @requires Account model for update that model
 * @returns {json} on success - success message only
 * @returns {json} on fail - server error
 * @borrows req.params.id as id from url
 * @borrows friend email check from check-account.js
 * @summary handle PATCH method api request on /accounts/addFriend/:id url
 * @async
 */
const addFriend = async (req, res) => {
  const id = req.params.id;

  // adding friends email to array of invites
  await Account.findOneAndUpdate(
    { _id: id },
    {
      $push: {
        invites: req.body.friendEmail
      }
    }
  ).catch(err => {
    console.log(err);
    res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  return res.status(200).json({
    message: "Friend Added"
  });
};

/**
 * @description will fatch all acounts with owner email from currently logged in userId
 * @borrows req.userAuth.id as userId from check-auth.js middleware
 * @requires Account model to use find() method
 * @returns {json} on success - fatched accounts with 200
 * @returns {json} on fail - server error
 * @see ownAccounts,data
 * @summary handle GET method api request on /accounts url
 * @async
 */
const getAccountsByUserId = async (req, res, next) => {
  const userId = req.userAuth.id;

  var ownAccounts = await Account.find({
    owner: userId
  })
    .sort({ createdAt: -1 })
    .populate("owner", "email")
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err,
        message: "Server Error"
      });
    });

  // returning accounts
  return res.status(200).json({
    data: ownAccounts
  });
};

/**
 * @description will fatch single acount from provided account id in url as param
 * @borrows req.params.id as accountId
 * @requires Account model for update that model
 * @returns {json} on fail - server error
 * @returns {json} on success - fatched account with 200
 * @see account,data
 * @summary handle GET method api request on /accounts/:id url
 * @async
 */
const getAccountByAccountId = async (req, res) => {
  const accountId = req.params.id;
  //checking if user is accessing own account or not
  var account = await Account.findOne({
    _id: accountId
  }).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  // returning accounts
  return res.status(200).json({
    data: account
  });
};

/**
 * @description will fatch all acounts from given email
 * @borrows req.params.email as userEmail
 * @requires User model to find ownerId from given email
 * @requires Account model to find accounts from ownerId
 * @returns {json} on fail - server error
 * @returns {json} on success - fatched accounts with 200
 * @see accounts,data
 * @summary handle GET method api request on /accounts/email/:email url
 * @async
 */
const getAccountByEmail = async (req, res) => {
  const userEmail = req.params.email;

  var userId = await User.findOne({
    email: userEmail
  })
    .select({ _id: 1 })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err,
        message: "Server Error"
      });
    });

  var accounts = await Account.find({
    owner: userId
  })
    .select({ accountName: 1, _id: 1 })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err,
        message: "Server Error"
      });
    });

  // returning accounts
  return res.status(200).json({
    data: accounts
  });
};

/**
 * @description delete account with its transections
 * @borrows req.params.id as accountId
 * @requires Account model to remove account data
 * @requires Transection model to remove transection data
 * @returns {json} on fail - server error
 * @returns {json} on success - account removed message with 200
 * @summary handle DELETE method api request on /accounts url
 * @async
 */
const deleteAccount = async (req, res, next) => {
  const accountId = req.params.id;

  await Account.remove({ _id: accountId }).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  await Transection.remove({
    $or: [{ toAccount: accountId }, { fromAccount: accountId }]
  }).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  return res.status(200).json({
    message: "Account Removed"
  });
};

module.exports = {
  deleteAccount,
  addAccount,
  addFriend,
  editAccount,
  getAccountByAccountId,
  getAccountByEmail,
  getAccountsByUserId
};
