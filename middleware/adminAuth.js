const isLogin = async (req, res, next) => {
    
    try {
        console.log("admin mid ")
        if (req.session.admin) {
            console.log("admin mid if")
            
            next();

        } else {

            res.redirect("/admin");

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

const isLogout = async (req, res, next) => {

    try {

        if (req.session.admin) {
            
            res.redirect("/admin/dashboard");

        } else {

            next();

        }
        
    } catch (error) {

        console.log(error.message);
        
    }  

};



module.exports = {

    isLogin,
    isLogout,

}