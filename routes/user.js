const express = require('express');
const router = express.Router();
const userController= require('../controllers/userController')

router.get('/', (req, res) => {
  res.render('home', { title: 'Home' });
});

router.get('/login', (req, res) => {
  res.render('../views/users/login.ejs', { title: 'Login' });
});
router.get('/shop', (req, res) => {
  res.render('../views/users/shop.ejs', { title: 'Login' });
});
router.get('/wishlist', (req, res) => {
  res.render('../views/users/wishlist.ejs', { title: 'Login' });
});
router.post('/signUp',userController.signUp);

module.exports = router;
