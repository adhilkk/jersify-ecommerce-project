

const User = require("../models/userModel")
const bcryptjs = require("bcryptjs");
const nodemailer = require('nodemailer');

// In-memory storage for OTPs and user data
const otpStorage = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'adhilkk8@gmail.com',
    pass: 'dfwx sikz dfqe erjq'
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = (email, otp) => {
  const mailOptions = {
    from: 'adhilkk8@gmail.com',
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP is ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};


const register_user = async (req, res) => {
  const { userFullName, registerEmail, registerPhone, registerPassword, registerCpassword } = req.body;

  if (registerPassword !== registerCpassword) {
    return res.render('users/register', { pswMsg: 'Passwords do not match', success: false });
  }

  const securePassword = async (password) => {
    try {
      const passwordHash = await bcryptjs.hash(password, 10);
      return passwordHash;
    } catch (error) {
      res.status(400).send(error.message);
    }
  };

  try {
    const spassword = await securePassword(registerPassword);
    console.log(spassword + "pppppp");
    const otp = generateOTP();

    const userData = await User.findOne({ email: registerEmail });
    if (userData) {
      res.render('users/register', { registerMsg: 'Email already exists', registerSuccess: false });
    } else {
      // Store user data and OTP in the in-memory object
      otpStorage[registerEmail] = {
        fullName: userFullName,
        email: registerEmail,
        password: spassword,
        phoneNumber: registerPhone,
        otp: otp
      };

      sendOTP(registerEmail, otp);
      res.render('users/otp', { email: registerEmail }); // Render OTP page with email
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const verify_otp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const tempUser = otpStorage[email];
    if (!tempUser) {
      return res.render('users/otp', { otpMsg: 'Invalid email', email: email });
    }

    if (tempUser.otp === otp) {
      const newUser = new User({
        fullName: tempUser.fullName,
        email: tempUser.email,
        password: tempUser.password,
        phoneNumber: tempUser.phoneNumber
      });

      await newUser.save();
      delete otpStorage[email]; // Remove temporary user data
      res.redirect('/login'); // Redirect to login page after successful verification
    } else {
      res.redirect('users/otp', { otpMsg: 'Invalid OTP', email: email });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};
  

  const login_user = async (req, res) => {
    try {
        const { Email, password } = req.body;

        const userData = await User.findOne({ email : Email });

         if (!userData || !(await bcryptjs.compare(password, userData.password))) {
            // Invalid email or password
            return res.render('users/login', { error: 'Invalid email or password' });
        }

        // Handle successful login 
        
          res.render('users/dashboard'); // Adjust the redirect as needed

    } catch (error) {
        res.status(400).send(error.message);
    }
};

  

  
  module.exports = {
    register_user,
    login_user,
    verify_otp
  };