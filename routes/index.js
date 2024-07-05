const express = require('express');
const router = express.Router();

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

module.exports = router;
