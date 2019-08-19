var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abhiabhiabhi123.ap@gmail.com',
    pass: '#aaditya'
  }
});

var mailOptions = {
  from: 'abhiabhiabhi123.apgmail.com',
  to: 'abhijagudanmehsana@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error)
  } else {
    console.log('Email sent: ' + info.response);
  }
});