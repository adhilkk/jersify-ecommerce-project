const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('css', express.static(path.join(__dirname, 'public/assets/css')));

app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('js', express.static(path.join(__dirname, 'public/assets/js')));

// View Engine
app.set('view engine', 'ejs');

// Database connection
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.render('users/home.ejs')
});
app.get('/cart', (req, res) => {
    res.render('users/cart.ejs')
  });
//
const indexRoute = require('./routes/index');
app.use('/', indexRoute);


// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
