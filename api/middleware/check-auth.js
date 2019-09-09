const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
        var bearerHeader = req.headers.authorization
        console.log(bearerHeader);
        var parts = bearerHeader.split(' ');
        if (parts.length === 2) {
            var scheme = parts[0];
            var credentials = parts[1];

            if (/^bearer$/i.test(scheme)) {
                token = credentials;
                //verify token
                const decoded = jwt.verify(token, process.env.jwtkey);
                req.userAuth = decoded;
                console.log(decoded)
                next()
            }
            else{
                return res.status(401).json({
                    message: 'Illegal Auth Header',
                })
            }
        }
        else{
            return res.status(401).json({
                message: 'Illegal Auth Header',
            })
        }
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({
            message: 'Auth Failed',
        })
    }
}