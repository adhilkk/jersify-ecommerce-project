

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
        const spassword =  await securePassword(req.body.password)
      const user = new User({
        fullName:req.body.name,
        email:req.body.email,
        password:spassword,
        phoneNumber:req.body.phoneNumber,
      });

      const userData = await User.findOne({email:req.body.email});
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