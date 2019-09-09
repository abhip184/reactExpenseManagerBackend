const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const User = require('../models/user');
var nodemailer = require('nodemailer');
exports.signup_user = async (req, res) => {
    //getting hash for password
    const hash = await bcrypt.hash(req.body.password, 10)
        .catch(err => {
            console.log(err)
            return res.status(409).json({
                message: "error in bcrypt"
            })
        })

        //adding new user model
    const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    //saving new user
    var result = await newUser.save().
        catch(err => {
            return res.status(500).json({
                error: err
            })
        })

        //genrating token
            const token = jwt.sign({
                email: result.email,
                id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
            },
                process.env.jwtkey,
                {
                    expiresIn: "24h"
                }
            );
        

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'abhiabhiabhi123.ap@gmail.com',
            pass: process.env.mailpass
        }
    });

    var mailOptions = {
        from: 'abhiabhiabhi123.ap@gmail.com',
        to: result.email,
        subject: "Welcome" + result.firstName,
        html: '<h1>Welcome to expense manager! </h1> <h2> <a href="http://192.168.0.125:3000/login"> click here</a> to get started </h2>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


    //sending new user
    return res.status(201).json({
        message: "Sign up success",
        userData:{
        token:token,
        userId: result._id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName
        }
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
            id: user[0]._id,
            firstName:user[0].firstName,
            lastName:user[0].lastName
        },
            process.env.jwtkey,
            {
                expiresIn: "24h"
            }
        );


        return res.status(200).json({
            message: "Login success",
            userData:{
            token:token,
            userId: user[0]._id,
            email: user[0].email,
            firstName: user[0].firstName,
            lastName: user[0].lastName
            }
        })
    }
    else {
        return res.status(401).json({
            message: 'username or password not matched !!',
        })

    }
}