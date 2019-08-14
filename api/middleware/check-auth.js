const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    var token
    try{
    var token = req.cookies.token
    console.log(token);
    const decoded = jwt.verify(token, process.env.jwtkey);
    req.userAuth = decoded;
    console.log(req.userAuth);
    next()
    }
    catch(err)
    {
        return res.status(401).json({
            message: 'Auth failed',
            error:err,
            token:token
            
        })
    }
}