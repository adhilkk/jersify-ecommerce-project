const passport = require('passport'); 
const GoogleStrategy = require('passport-google-oauth2').Strategy; 

passport.serializeUser((user , done) => { 
	done(null , user); 
}) 
passport.deserializeUser(function(user, done) { 
	done(null, user); 
}); 
console.log('Client ID:', process.env.CLIENT_ID)
// passport.use(new GoogleStrategy({
// 	clientID: "992260077562-13ru04roi1rt8m098pv7v5ai9qr7r79i.apps.googleusercontent.com",
// 	clientSecret: process.env.CLIENT_SECRET,
// 	callbackURL: "http://localhost:5000/auth/google/callback",
// 	passReqToCallback: true
//   }, 
function(request, accessToken, refreshToken, profile, done) { 
	return done(null, profile); 
} 
));
