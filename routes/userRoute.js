const express = require('express');
require('dotenv').config();
const user_router = express()
const user_Controller= require('../controllers/userController');
const cart_controller= require('../controllers/cartController');
const profile_controller= require('../controllers/userprofile');
const address_controller= require('../controllers/addressController');
const checkoutController= require('../controllers/checkoutController');
const orderController= require('../controllers/orderController');
const userAuth = require('../middleware/userAuth')
const passport = require('passport')
require('../passport')

user_router.use(passport.initialize())
user_router.use(passport.session())
user_router.set('view engine', 'ejs');

const bodyParser = require("body-parser");
user_router.use(bodyParser.json());
user_router.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");
user_router.use(express.static('public'))



user_router.get('/wishlist', (req, res) => {
  res.render('../views/users/wishlist.ejs', { title: 'Login' });
});



 
user_router.get('/' , user_Controller.loadHome)
user_router.post('/login',user_Controller.login_user);
user_router.get('/login' , user_Controller.loadLogin)
user_router.get('/logout' , user_Controller.loadLogout)
user_router.get('/shop' , user_Controller.loadShop)


user_router.get('/registerPage',user_Controller.loadRegister)
user_router.post('/register', user_Controller.register_user);
user_router.post('/verify-otp', user_Controller.verify_otp); 
user_router.post('/resend-otp', user_Controller.resend_otp);



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

	
//user profile 
	
user_router.get('/profile',profile_controller.profileLoad)
user_router.post('/editProfile',profile_controller.editProfile)
user_router.post('/editPassword',profile_controller.passCange)
user_router.get('/Address',address_controller.loadAddress)
user_router.post('/addAddress',address_controller.addAddress)
user_router.post('/deleteAdd',address_controller.deleteAddress)
user_router.put("/editAddress", address_controller.editAddress);
user_router.post("/verifyEditAddress", address_controller.verifyEditAddress);



//produts

user_router.get('/product', user_Controller.products);
user_router.get('/productDetails',user_Controller.productDetails)

	
// cart


user_router.get('/cart',cart_controller.cartLoad)
user_router.post('/addCart',cart_controller.addCart)
user_router.put('/cartUpdate' , cart_controller.cartEdit)
user_router.put('/deleteCart' , cart_controller.deleteCart);
user_router.post("/cartAction", user_Controller.cartAction);


//  Filter 
user_router.put('/priceFilter', user_Controller.priceFilter);
user_router.put("/newArrivals", user_Controller.newArrivals);
user_router.put("/aAzZ", user_Controller.aAzZ);
user_router.put("/zZaA", user_Controller.zZaA);
user_router.put("/lowToHigh", user_Controller.lowToHigh);
user_router.put('/highTolow', user_Controller.highTolow);


//  Orders 

user_router.get('/orders',  orderController.loadOrder);
user_router.get("/orderDetails",  orderController.orderView);
user_router.post('/getOrder', orderController.orderRecieved);
user_router.get('/thanks', orderController.loadThanks);
user_router.post('/cancelOrd', orderController.orderCancel);
user_router.put('/returnOrd', orderController.returnOrd);


//  CheckOut

user_router.get('/checkout',checkoutController.loadCheckout);
user_router.post("/verifyChekutAdss", checkoutController.verifyCheckOutAddress);
user_router.put("/editAddressCheckout", checkoutController.editAddress);
user_router.post('/verifyEditAddCheckout', checkoutController.verifyEditAddress);
user_router.post('/deleteCheckAdd', checkoutController.deleteAdd);




module.exports = user_router;
