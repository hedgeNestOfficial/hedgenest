const passport = require('passport');
const crypto = require('crypto');
const user = require('../model/user');
const GoogleStrategy = require ('passport-google-oauth20').Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.Google_Client_ID,
    clientSecret:process.env.Google_Client_Secret,
    callbackURL: process.env.callbackURL
  },
  async (accessToken, refreshToken, profile, cb)=> {
    try {
        //check if the user is already signed up
         let user = await user.findOne({ email: profile._json.email})
         //if not signed up create a new account for the user using the details gotten from google
         if(!user){
            user = new user({
                firstName:profile._json.given_name,
                lastName:profile._json.family_name,
                phoneNumber:`${Math.floor(Math.random() * 1E11)}`,
                email:profile._json.email,
                password: crypto.randomBytes(32).toString('hex'),
                isVerified:profile._json.email_verified,
                profilePicture: {
                  url: profile._json.picture
                }
            })

            await user.save()
         }
         return cb(null,user)

    } catch (error) {
        console.log(error)
        return cb(error)
    }
  }
));

passport.serializeUser((user, done)=> {
  done(null, user.id);
})

passport.deserializeUser(async(id, done)=> {
  const user = await user.findById(id)
    if(!user){
        return done(new Error('User not found'), null)
    }
    done(null, user);
  });
  const profile = passport.authenticate('google',{ scope: ['profile', 'email']})

  const loginProfile = passport.authenticate('google',{ failureRedirect: '/login'})
  

  module.exports = {passport, profile,loginProfile}