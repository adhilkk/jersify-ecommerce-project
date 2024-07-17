const express = require('express');
require('dotenv').config();
const user_router = express()
const user_Controller= require('../controllers/userController');
const cart_controller= require('../controllers/cartController');
const profile_controller= require('../controllers/userprofile');
const address_controller= require('../controllers/addressController');
const passport = require('passport')
require('../passport')

user_router.use(passport.initialize())
user_router.use(passport.session())



user_router.set('view engine', 'ejs');
// user_router.set('views','../views/users')


const bodyParser = require("body-parser");
user_router.use(bodyParser.json());
user_router.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");

user_router.use(express.static('public'))

const userAuth = require('../middleware/userAuth')




// user_router.get('/', (req, res) => {
//   res.render('users/home', { title: 'Home' });
// });

user_router.get('/' , user_Controller.loadHome)

user_router.get('/login' , user_Controller.loadLogin)

user_router.post('/logout' , user_Controller.loadLogout)

user_router.get('/shop' , user_Controller.loadShop)

// user_router.get('/login', (req, res) => {
//   res.render('../views/users/login.ejs', { title: 'Login' });
// });
user_router.get('/register', (req, res) => {
  res.render('../views/users/register.ejs', { title: 'register' });
});
user_router.get('/shop', (req, res) => {
  res.render('../views/users/shop.ejs', { title: 'Login' });
});
user_router.get('/wishlist', (req, res) => {
  res.render('../views/users/wishlist.ejs', { title: 'Login' });
});
user_router.get('/myProfile', (req, res) => {
  res.render('../views/users/myProfile.ejs', { title: 'myProfile' });
});




user_router.post('/register',user_Controller.register_user)

user_router.post('/register', (req, res) => {
 
});

user_router.post('/login',user_Controller.login_user);

user_router.post('/register', user_Controller.register_user);
user_router.post('/verify-otp', user_Controller.verify_otp);
user_router.post('/resend-otp', user_Controller.resend_otp);

//produst show
user_router.get('/product', user_Controller.products);


//product details
user_router.get('/productDetails',user_Controller.productDetails)

// user_router.get('/', user_Controller.loadAuth);

// Auth 
user_router.get('/auth/google' , passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
})); 

// Auth Callback 
user_router.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/success', 
		failureRedirect: '/failure'
}));

// Success 
user_router.get('/success' , user_Controller.successGoogleLogin); 

// failure 
user_router.get('/failure' , user_Controller.failureGoogleLogin);





//__________ user profile 
user_router.get('/profile',profile_controller.profileLoad)

// edit user profile 
user_router.post('/editProfile',profile_controller.editProfile)
// change password
user_router.post('/editPassword',profile_controller.passCange)



// aadd address show 
user_router.get('/Address',address_controller.loadAddress)
// add post 
user_router.post('/addAddress',address_controller.addAddress)
// delete address 
user_router.post('/deleteAdd',address_controller.deleteAddress)

user_router.put("/editAddress", address_controller.editAddress);
// edit address update
user_router.post("/verifyEditAddress", address_controller.verifyEditAddress);

// cart load
user_router.get('/cart',cart_controller.cart)

// add cart
user_router.post('/addCart',cart_controller.addCart)

//cart edit

user_router.put('/cartUpdate' , cart_controller.cartEdit)

//  deleteCart 
user_router.put('/deleteCart' , cart_controller.deleteCart);

//  Cart Count (post)
user_router.post("/cartAction", user_Controller.cartAction);


//  Price Filter (put)
user_router.put('/priceFilter', user_Controller.priceFilter);

//  SortProName (put)
user_router.put("/aAzZ", user_Controller.aAzZ);

//  SortProName (put)
user_router.put("/zZaA", user_Controller.zZaA);

//  lowTohigh (put)
user_router.put("/lowToHigh", user_Controller.lowToHigh);

//  highTolow (put)
user_router.put('/highTolow', user_Controller.highTolow);




module.exports = user_router;
