

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

const loadLogin = async (req , res) => {

  try {

    if(req.session.user){

      res.redirect('/')

    } else {

      res.render('users/login')

    }
    
  } catch (error) {
    
  }

}

const loadShop = async (req , res) => {


    try {

      res.render('users/product')
      
    } catch (error) {
      
    }

}

const login_user = async (req, res) => {
  try {
      const { Email, password } = req.body;

      const userData = await User.findOne({ email: Email });

      if (!userData || !(await bcryptjs.compare(password, userData.password))) {
          // Invalid email or password
          res.redirect('/users/login', { error: 'Invalid email or password' });
      }

      if (userData.is_blocked) {
          // User is blocked
           res.redirect('/users/login', { error: 'Your account is blocked. Please contact support.' });
      }

      // Handle successful login
      console.log(userData);
      req.session.user = userData
      res.redirect('/'); // Adjust the redirect as needed

  } catch (error) {
      res.status(400).send(error.message);
  }
};


const products = async(req,res)=>{
  try {
      const login = req.session.user
      const producDataa = await product.find({status :true}).populate('category')
      // console.log(producData);
      const categoryData = await category.find({is_listed: true})

      res.render('users/product' , { producData : producDataa,categoryData,login})
    
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

const successGoogleLogin = async (req , res) => { 
if(!req.user) 
  res.redirect('/failure'); 
  console.log(req.user);
  
  // send data to database a
  //check with session
  const newUser = new User({
    fullName: req.user.given_name,
    email: req.user.email,
   
  });

  const userNew = await newUser.save();

  console.log(userNew._id);

  if (!req.session.user) {
    req.session.user = {};
  }
  req.session.user._id = userNew._id;
  res.redirect('/'); 
}


const failureGoogleLogin = (req , res) => { 
res.send("Error"); 
}
  
const loadHome = async (req , res) => {
   
  try {

    if(req.session.user){

      res.render('users/home' , {login : req.session.user})

    } else {

      res.render('users/home')

    }
    
  } catch (error) {

    console.log(error.message);
    
  }

}

const loadLogout = async (req , res) => {

  try {

    if(req.session.user){

      req.session.user = undefined
      res.redirect('/login')

    } else {

      res.redirect('/')

    }

  } catch (error) {

    console.log(error.message);
    
  }

}


const cartAction = async (req, res) => {
    
  try {

      if (req.session.user) {
          
          const userIdd = req.session.user._id;

          const cartAcction = await cart.findOne({ userId: userIdd });

          const val = cartAcction.product.length;

          res.send({ success: val });

      } else {

          res.send({success : 0})

      }
     
  } catch (error) {

      console.log(error.message);
      
  }

};




//  Price Filter (Put Metthod) :-

const priceFilter = async (req, res , next) => {
    
  try {

      const minn = req.body.min
      const maxx = req.body.max

      if (minn && maxx) {
              
          const productPrice = await product.find({ $and: [{ price: { $lt: Number(maxx) } }, { price: { $gt: Number(minn) } }] }).populate('category')

          if (productPrice) {
              
              res.send({ success: productPrice });

          } else {

              res.send({fail : "failed"})

          }

      } else {

          res.send({fail : "failed"})

      }

  } catch (error) {

      next(error,req,res);

      
  }

};

//===============================//

// sort on New arrivals 

const newArrivals = async (req, res, next) => {
  try {
      const { status, newArrival } = req.body;

      let query = {};

      if (status) {
          query.status = true;
      }

      let sortOptions = { name: 1 }; // default sorting by name

      if (newArrival) {
          sortOptions = { createdAt: -1 }; // sort by createdAt in descending order
      }

      const products = await product.find(query).sort(sortOptions).populate('category');
      res.send(products);
  } catch (error) {
      next(error, req, res);
  }
};



//  Acending Order Product Name (Put Method) :-

const aAzZ = async (req, res , next) => {
  
  try {

      const { status } = req.body;

      if (status) {
          
          const products = await product.find({ status: true }).sort({ name: 1 }).populate('category');
          
          res.send(products);

      }
      
  } catch (error) {

      next(error,req,res);

      
  }

};

//===============================//

//  Decending Order Product Name (Put Method) :-

const zZaA = async (req, res , next) => {
  
  try {

      const { status } = req.body;

      if (status) {
          
          const products = await product.find({ status: true }).sort({ name: -1 }).populate('category');

          res.send(products);

      }
      
  } catch (error) {

      next(error,req,res);

      
  }

};

//===============================//

//  Price Low to High (Put Method) :-

const lowToHigh = async (req, res , next) => {
  
  try {

      const { status } = req.body;

      if (status) {
          
          const products = await product.find({ status: true }).sort({ price: 1 }).populate('category');

          res.send(products)

      }
      
  } catch (error) {

      next(error,req,res);

      
  }

};

//===============================//

//  Price High To Low (Put Method) :-

const highTolow = async (req, res , next) => {
  
  try {

      const { status } = req.body;

      if (status) {
          
          const products = await product.find({ status: true }).sort({ price: -1 }).populate('category');

          res.send(products);
      }
      
  } catch (error) {

      next(error,req,res);

      
  }

}

const catchAll = async (req, res , next) => {
    
  try {

      const categoryData = await Category.find({ is_Listed: true });

      if (req.session.user) {
          
          res.render('404');

      } else {

          res.render('404', { categoryData });

      }
      
  } catch (error) {

      next(error,req,res);

      
  }

};

  
  module.exports = {
    register_user,
    login_user,
    verify_otp,
    products,
    productDetails,
    resend_otp,
    loadAuth,
    successGoogleLogin,
    failureGoogleLogin,
    loadHome,
    loadLogin,
    loadLogout,
    loadShop,
    cartAction,
    priceFilter,
    catchAll,
    aAzZ,
    zZaA,
   lowToHigh,
    highTolow,
    newArrivals,

  }