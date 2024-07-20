const User = require("../models/userModel")
const Admin = require("../models/adminModel")
const bcrypt = require("bcryptjs");
const Category = require("../models/categoryModel")
const categoryController= require('../controllers/categoryController');

const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });


// load userlist to dashboard

const loadusers = async(req,res)=>{
    try {
        

        const limit = 5;
        const page = parseInt(req.query.page) || 1
        const skip = (page -1 ) * limit;

        const totalusercount = await User.countDocuments()
        const totalPages = Math.ceil(totalusercount / limit)

        const userData = await User.find()

        .skip(skip)
        .limit(limit)

        

        res.render('../views/admin/userList.ejs',{clint : userData, currentPage : page,totalPages})
       
    } catch (error) {
        console.log(error.message);
    }
}




const renderLogin = (req, res) => {
    res.render('admin/adminLogin');
  };
  
  const handleLogin = async (req, res) => {
    const { adminEmail, password } = req.body;

    console.log(adminEmail,password);
  
    try {
      const admin = await Admin.findOne({ email:adminEmail.trim() });
      console.log(admin);
  
      if (!admin) {
        return res.render('admin/adminLogin.ejs', { loginMsg: 'Invalid email or password', loginSuccess: false });
      }
  
      const isPasswordValid = await bcrypt.compare(password, admin.password);
  
      if (!isPasswordValid) {
        return res.render('admin/adminLogin.ejs', { loginMsg: 'Invalid email or password', loginSuccess: false });
      }
  
      // If email and password are correct, redirect to the dashboard

      if (!req.session.admin) {
        req.session.admin = {};
      }
      req.session.admin = admin._id;
      res.redirect('/admin/dashboard');
  
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Internal server error');
    }
  };

  const handleLogout = async (req , res) => {

    try {
  
      if(req.session.admin){
  
        req.session.admin = undefined
        res.redirect('/admin')
  
      } else {
  
        res.redirect('/admin/dashboard')
  
      }
  
    } catch (error) {
  
      console.log(error.message);
      
    }
  
  }
  
  
  const renderDashboard = (req, res) => {
    try {
        res.render("admin/dashboard.ejs")
    } catch (error) {
        console.log(error.message);
    }
  };


  //blockingggg

  const getUsers = async (req, res) => {
    try {
      const users = await User.find({});
      res.render('admin/users', { clint: users });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  
  const toggleBlockUser = async (req, res) => {
    const userId = req.params.id;
    console.log('fcfhgbhghg');
    try {
      const user = await User.findById(userId);
      user.is_blocked = !user.is_blocked;
      await user.save();
      console.log(user);
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };


//adminCategory

const adminCategory = async (req, res) => {

  try {

      const limit = 5;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      const totalCatCount = await Category.countDocuments();
      const totalPages = Math.ceil(totalCatCount / limit);

      const categoryData = await Category.find()

      .skip(skip)
      .limit(limit);

      res.render("../views/admin/adminCategory.ejs" , {Category : categoryData ,  currentPage: page, totalPages});
      
  } catch (error) {
      
      console.log(error.message);

  }

};





module.exports= {
    loadusers,
    renderDashboard,
    handleLogin,
    renderLogin,
    getUsers,
    toggleBlockUser,
    adminCategory,
    handleLogout,
}

