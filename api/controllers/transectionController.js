const mongoose = require("mongoose");
const Transection = require("../models/transection");
const Account = require("../models/account");
const User = require("../models/user");


const getAccountBalance = async (req, res) => {
  const id = req.params.id;
  var incomeAmount, expenseAmount;

  //toAccount holds only incomes and fromAccount holds only expenses diffrence of them is current balance

  //finding income
  const totalIncome = await Transection.aggregate([
    { $match: { toAccount: new mongoose.Types.ObjectId(id) } },
    { $group: { _id: { income: "$toAccount" }, subtotal: { $sum: "$amount" } } }
  ]).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  //finding expense
  const totalExpense = await Transection.aggregate([
    { $match: { fromAccount: new mongoose.Types.ObjectId(id) } },
    {
      $group: { _id: { income: "$fromAccount" }, subtotal: { $sum: "$amount" } }
    }
  ]).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });

  //protecting from null or undefined values
  if (totalIncome.length <= 0) {
    incomeAmount = 0;
  } else {
    incomeAmount = totalIncome[0].subtotal;
  }
  if (totalExpense.length <= 0) {
    expenseAmount = 0;
  } else {
    expenseAmount = totalExpense[0].subtotal;
  }

  const currentBalance = incomeAmount - expenseAmount;
  console.log(currentBalance + "currentBalance ");

  //updating new balance to account
  await Account.findOneAndUpdate(
    { _id: id },
    { $set: { currentBalance: currentBalance } },
    { new: true }
  ).catch(err => {
    console.log(err);
    return res.status(500).json({
      message: "Error occured While updating balance",
      error: err
    });
  });

  return res.status(200).json({
    balance: currentBalance,
    accountId: id
  });
};

const addTransection = async (req, res) => {
  //decide modal based on transection type

  if (req.body.type === "income") {
    transection = new Transection({
      _id: new mongoose.Types.ObjectId(),
      to: req.userAuth.id,
      amount: req.body.amount,
      type: req.body.type,
      category: req.body.category,
      toAccount: req.body.accountId
    });
  }

  if (req.body.type === "expense") {
    transection = new Transection({
      _id: new mongoose.Types.ObjectId(),
      from: req.userAuth.id,
      amount: req.body.amount,
      type: req.body.type,
      category: req.body.category,
      fromAccount: req.body.accountId
    });
  }

  if (req.body.type === "transfer") {
    var to = await User.findOne({ email: req.body.to }).select({ _id: 1 });
    transection = new Transection({
      _id: new mongoose.Types.ObjectId(),
      to: to._id,
      from: req.userAuth.id,
      amount: req.body.amount,
      type: req.body.type,
      category: req.body.category,
      toAccount: req.body.toAccount,
      fromAccount: req.body.fromAccount
    });
  }

  //saving transection
  var firstResult = await transection.save().catch(err => {
    return res.status(500).json({
      error: err,
      message: "error occured while saving transection"
    });
  });

  //sending recently created transection additional information
  var result = await Transection.populate(firstResult, [
    { path: "toAccount" },
    { path: "fromAccount" },
    { path: "to" },
    { path: "from" }
  ]);

  return res.status(200).json({
    savedTransection: result,
    message: "Transection Saved"
  });
};

const editTransection = (req, res) => {
  const id = req.params.id;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  Transection.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      return res.status(200).json({
        message: "Transection updated"
      });
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err,
        message: "Server Error"
      });
    });
};

const getTransectionsByAccount = async (req, res) => {
  
  const id = req.params.id;
  const account = await Account.findOne({ _id: id })
    .populate("owner")
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err,
        message: "Server Error"
      });
    });

  const transections = await Transection.find({
    $or: [
      { toAccount: new mongoose.Types.ObjectId(id) },
      { fromAccount: new mongoose.Types.ObjectId(id) }
    ]
  })
    .sort({ atDate: -1 })
    .populate("toAccount")
    .populate("fromAccount")
    .populate("to")
    .populate("from")
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err,
        message: "Server Error"
      });
    });

  return res.status(200).json({
    transections: transections,
    account: account
  });
};

const deleteTransection = async (req, res, next) => {
  
  const id = req.params.id;
  const result = await Transection.remove({ _id: id }).catch(err => {
    return res.status(500).json({
      error: err,
      message: "Server Error"
    });
  });
  return res.status(200).json({
    result: result,
    message: "Transection deleted"
  });
};

module.exports = {
  getAccountBalance,
  getTransectionsByAccount,
  editTransection,
  addTransection,
  deleteTransection
};
