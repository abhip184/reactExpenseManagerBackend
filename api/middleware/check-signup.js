const User = require('../models/user');
module.exports = async (req,res,next)=> {
    //checking user email already exist or not
    var user = await User.find({ email: req.body.email })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

    if (user.length >= 1) {
        return res.status(409).json({
            message: "email exists"
        })
    }
    else{
        next()
    }

}