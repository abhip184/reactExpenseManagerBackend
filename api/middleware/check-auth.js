const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    var token
    try{
    var token = req.cookies.token
    console.log("token"+req.cookies.email);
    const decoded = jwt.verify(token, process.env.jwtkey);
    req.userAuth = decoded;
    console.log(decoded)
    if(req.userAuth.email == req.cookies.email && req.userAuth.id == req.cookies.userId)
    {
        console.log("auth pass");
        next()
    }
    else
    {
        return res.render('index')
    }
   
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