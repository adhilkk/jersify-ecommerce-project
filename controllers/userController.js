

const User = require("../models/userModel")
const bcryptjs = require("bcryptjs");



//user registeration
const register_user = async(req, res) => {
  const { userFullName, registerEmail, registerPhone, registerPassword, registerCpassword } = req.body;
  if (registerPassword !== registerCpassword) {
    return res.render('users/register', { pswMsg: 'Passwords do not match', success: false });
  }

    const securePassword = async(password)=>{
        try {
            const passwordHash = await bcryptjs.hash(password,10);
            return passwordHash;
        } catch (error) {
            res.status(400).send(error.message)
        }
    }
    try {
        const spassword =  await securePassword(req.body.registerPassword)
      const user = new User({
        fullName:req.body.userFullName,
        email:req.body.registerEmail,
        password:spassword,
        phoneNumber:req.body.registerPhone,
      });

      console.log(user);

      const userData = await User.findOne({email:req.body.registerEmail});
      if(userData){
        // res.status(200).send({success:false,msg:"this email is already exists"});
         res.render('users/register', { registerMsg: 'Email already exists', registerSuccess: false });
      }else{
        const user_data = await user.save();
        res.status(200).send({success:true,data:user_data})
    }
  
    } catch (error) {
      res.status(400).send(error.message);
      
      
    }
  };
  


  const login_user = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userData = await User.findOne({ email });
  
      if (!userData) {
        return res.render('users/login', { error: 'Invalid email or password' });
      }
  
      const isPasswordMatch = await bcryptjs.compare(password, userData.password);
      if (!isPasswordMatch) {
        return res.render('users/login', { error: 'Invalid email or password' });
      }
  
      // Handle successful login 
      res.redirect('/'); // Adjust the redirect as needed
  
    } catch (error) {
      res.status(400).send(error.message);
    }
  };
  

  
  module.exports = {
    register_user,
    login_user
  };