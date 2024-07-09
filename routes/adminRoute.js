const express = require('express');
const admin_router = express()
const adminController= require('../controllers/adminController');
const path = require('path')

const bodyParser = require("body-parser");
admin_router.use(bodyParser.json());
admin_router.use(bodyParser.urlencoded({extended:true}));
admin_router.use('/asset', express.static(path.join(__dirname, '../public/asset')));


admin_router.get('/', (req, res) => {
    res.render('../views/admin/adminLogin.ejs', { title: 'admin' });
  });
  
  
  // admin_router.get('/userList', (req, res) => {
  //   res.render('../views/admin/userList.ejs', { title: 'userlist' });
  // });
  admin_router.get('/userList', adminController.loadusers);


  // Render login form


// Handle login form submission
admin_router.post('/adminLogin', adminController.handleLogin);

// Dashboard route
admin_router.get('/dashboard', adminController.renderDashboard);



//for blocking

admin_router.get('/admin/users', adminController.getUsers);
admin_router.get('/admin/users/:id', adminController.toggleBlockUser);


module.exports = admin_router;