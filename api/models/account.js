const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    accountName: {type:String, required: true}, 
    currentBalance:{type: Number, required:true},
    owner:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    invites:[{type:String,}],
})

 accountSchema.post('save', function(doc) {
    console.log('%s has been saved', doc._id);
  });

module.exports = mongoose.model('Account',accountSchema);