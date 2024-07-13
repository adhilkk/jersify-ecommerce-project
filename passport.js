const passport = require('passport'); 
const GoogleStrategy = require('passport-google-oauth2').Strategy; 
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

passport.serializeUser((user , done) => { 
	done(null , user); 
}) 
passport.deserializeUser(function(user, done) { 
	done(null, user); 
}); 
console.log(process.env.CLIENT_SECRET,'siuu')
passport.use(new GoogleStrategy({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: "http://localhost:5000/auth/google/callback",
	passReqToCallback: true
  }, 
function(request, accessToken, refreshToken, profile, done) { 
	return done(null, profile); 
} 
));