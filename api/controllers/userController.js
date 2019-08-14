const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const User = require('../models/user');
exports.signup_user = async (req, res, next) => {

    console.log(req.body.password);
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



    const hash = await bcrypt.hash(req.body.password, 10)
        .catch(err => {
            return res.status(409).json({
                message: "error in bcrypt"
            })
        })

    const token = jwt.sign({
        email: req.body.email,
        id: req.body.password
    },
        process.env.jwtkey,
        {
            expiresIn: "1h"
        }
    );


    console.log("hash")
    console.log(hash)
    console.log("token")
    console.log(token)
    const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash,
        token: token,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    var result = await newUser.save().
        catch(err => {
            return res.status(500).json({
                error: err
            })
        })

    res.cookie('token', req.token);
    res.cookie('firstName', req.body.firstName);
    return res.status(201).json({
        message: "Sign up success",
        userId: result._id,
        email: result.email,
        firstName: result.firstName,
    })
}

exports.login_user = async (req, res, next) => {

    var user = await User.find({ email: req.body.email })

    if (user.length < 1) {
        return res.status(401).json({
            message: 'Username Or Password not Matched'
        })
    }
    const result = await bcrypt.compare(req.body.password, user[0].password)
        .catch(err => {
            return res.status(401).json({
                message: 'Username Or Password not Matched'
            })
        })
    if (result) {
        const token = jwt.sign({
            email: user[0].email,
            id: user[0]._id
        },
            process.env.jwtkey,
            {
                expiresIn: "1h"
            }
        );

        res.cookie('token', token)
        res.cookie('userId', user[0]._id)
        res.cookie('firstName', user[0].firstName)
    
        return res.status(200).json({
            message: 'login success !!',
            userId: user[0]._id,
            token: token
        })
    }
    else {
        return res.status(401).json({
            message: 'username or password not matched !!',
        })

}
}

    exports.delete_user = (req, res, next) => {
        User.remove({ _id: req.params.id })
            .exec()
            .then(result => {
                res.status(200).json({
                    message: "user deleted"
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })
            })
    }

    exports.logout = (req, res, next) => {
        res.cookie('token', '')
        res.render('index');
    }