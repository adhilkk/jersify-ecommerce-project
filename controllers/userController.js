

const User = require("../models/userModel")
const bcryptjs = require("bcryptjs");
const register_user = async(req, res) => {

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
        res.status(200).send({success:false,msg:"this email is already exists"});
      }else{
        const user_data = await user.save();
        res.status(200).send({success:true,data:user_data})
    }
  
    } catch (error) {
      res.status(400).send(error.message);
      
      
    }
  };
  
  module.exports = {
    register_user
  };