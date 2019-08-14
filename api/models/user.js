const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    email: {type:String, 
        required: true, 
        unique: true, 
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},
    password:{type: String, required:true},
    token: {type: String},
    firstName:{type: String, required :true},
    lastName:{type: String, required :true},
    defaultAccount:{type: mongoose.Schema.Types.ObjectId, ref:'Account'},
})

module.exports = mongoose.model('User',userSchema);