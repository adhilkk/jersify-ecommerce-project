

const User = require("../models/userModel")
const product = require("../models/product")
const category = require("../models/categoryModel")
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
    from: 'your-email@gmail.com', // Replace with your email
    to: email,
    subject: 'OTP Verification',
    text: `Hello, Welcome to JERSIFY
    Your OTP is ${otp}`
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
    const otp = generateOTP();
    const otpTimestamp = Date.now();

    const userData = await User.findOne({ email: registerEmail });
    if (userData) {
      res.render('users/register', { registerMsg: 'Email already exists', registerSuccess: false });
    } else {
      // Store user data, OTP, and timestamp in the in-memory object
      otpStorage[registerEmail] = {
        fullName: userFullName,
        email: registerEmail,
        password: spassword,
        phoneNumber: registerPhone,
        otp: otp,
        otpTimestamp: otpTimestamp
      };

      sendOTP(registerEmail, otp);
      res.render('users/otp', { email: registerEmail });
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

    const currentTime = Date.now();
    const otpValidDuration = 60 * 1000; // 1 minute in milliseconds

    if (currentTime - tempUser.otpTimestamp > otpValidDuration) {
      return res.render('users/otp', { otpMsg: 'OTP has expired', email: email });
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
      res.render('users/otp', { otpMsg: 'Invalid OTP', email: email });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const resend_otp = async (req, res) => {
  const { email } = req.body;
  try {
    const tempUser = otpStorage[email];
    if (!tempUser) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    const newOTP = generateOTP();
    const otpTimestamp = Date.now();
    tempUser.otp = newOTP; // Update the OTP in the in-memory storage
    tempUser.otpTimestamp = otpTimestamp; // Update the OTP timestamp
    sendOTP(email, newOTP);

    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
};


const login_user = async (req, res) => {
  try {
      const { Email, password } = req.body;

      const userData = await User.findOne({ email: Email });

      if (!userData || !(await bcryptjs.compare(password, userData.password))) {
          // Invalid email or password
          return res.render('users/login', { error: 'Invalid email or password' });
      }

      if (userData.is_blocked) {
          // User is blocked
          return res.render('users/login', { error: 'Your account is blocked. Please contact support.' });
      }

      // Handle successful login
      res.render('users/home1'); // Adjust the redirect as needed

  } catch (error) {
      res.status(400).send(error.message);
  }
};


const products = async(req,res)=>{
  try {

      const producDataa = await product.find({status :true}).populate('category')
      // console.log(producData);
      const categoryData = await category.find({is_listed: true})

      res.render('users/product' , { producData : producDataa,categoryData})

  } catch (error) {
      console.log(error.message);
  }
}
  

const productDetails = async (req, res) => {
    
  try {

      const id = req.query.id;

      const categoryData = await category.find({ is_listed: true });      //  Category

      const productData = await product.findOne({ _id: id });     //  Product
      console.log(productData)

      const productRecom= await product.find({category:productData.category}).populate('category')

      console.log(productRecom);
       {
          
        

          res.render("users/productDetails", { categoryData , productData,productRecom});

      }
      
  } catch (error) {

      console.log(error.message);
      
  }

}

const loadAuth = (req, res) => {
  res.render('auth');
}

const successGoogleLogin = (req , res) => { 
if(!req.user) 
  res.redirect('/failure'); 
  console.log(req.user);
res.send("Welcome " + req.user.email); 
}

const failureGoogleLogin = (req , res) => { 
res.send("Error"); 
}

  
  module.exports = {
    register_user,
    login_user,
    verify_otp,
    products,
    productDetails,
    resend_otp,
    loadAuth,
    successGoogleLogin,
    failureGoogleLogin

  };