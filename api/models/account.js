const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    accountName: {type:String, required: true}, 
    currentBalance:{type: String, required:true},
    owner:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
})

module.exports = mongoose.model('Account',accountSchema);