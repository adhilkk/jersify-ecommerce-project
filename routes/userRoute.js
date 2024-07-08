const express = require('express');
const user_router = express()
const user_Controller= require('../controllers/userController');

const bodyParser = require("body-parser");
user_router.use(bodyParser.json());
user_router.use(bodyParser.urlencoded({extended:true}));

const multer = require("multer");
const path = require("path");

user_router.use(express.static('public'))




user_router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

user_router.get('/login', (req, res) => {
  res.render('../views/users/login.ejs', { title: 'Login' });
});
user_router.get('/register', (req, res) => {
  res.render('../views/users/register.ejs', { title: 'register' });
});
user_router.get('/shop', (req, res) => {
  res.render('../views/users/shop.ejs', { title: 'Login' });
});
user_router.get('/wishlist', (req, res) => {
  res.render('../views/users/wishlist.ejs', { title: 'Login' });
});




user_router.post('/register',user_Controller.register_user)

user_router.post('/register', (req, res) => {
 
});

user_router.post('/login',user_Controller.login_user);

module.exports = user_router;
