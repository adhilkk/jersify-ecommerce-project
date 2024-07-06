
// const bcrypt = require("bcrypt");
const signUp=  (req, res) => {
  try {
    console.log(req.body);

  } catch (error) {
    console.log(error.message);
  }
}
module.exports={
    signUp
}