var express=require('express');
var mongoose=require("mongoose");
var router=express.Router();
//jwt
var jwt = require("jsonwebtoken");
const APP_SECRET = "F@#e$!%w!&_q@#!z";
//facebook identity
const GOOGLE_CLIENT_ID = "500978717561-shm3hfs962b3bgs6aeshv7t67lib7e2m.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "G7eY-b9iQudJSSVhaKA9eGJM";

var passport = require('passport');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
var session = require('express-session');
//required session
router.use(session({
    secret: "tHiSiSasEcRetStr",
    resave: true,
    saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());
//serialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8090/auth/google/callback',
    passReqToCallback   : true
  },
  function(req, accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      // find the user in the database based on their google id
      var error = "ERROR";
      mongoose.model("users").findOne({ "googleId" : profile.id }, function(err, user) {
        if (err)
          return done(null, error);
          if (user) {
            return done(null, user);
          } else {
            //create user
            var userModel = mongoose.model("users");

            var userObject = {name:profile.displayName,email:profile.emails[0].value,googleId:profile.id,avatar:profile.photos[0].value};
            var user = new userModel(userObject);
            user.save(function(err){
              if(!err){
                return done(null, user);
              }else{
                return done(null, error);
              }
            })
         }
      });
    });
  }
));

router.get('/', passport.authenticate('google', { scope:
  	[ 'email', 'profile' ] }
));

router.get('/callback',
    passport.authenticate('google', { session:false }),
    function(req, res) {
        if(!req.user._id){
            res.json({loggedIn:false});
        }
        // Successful authentication
        var user_token = {_id:req.user._id};
        jwt.sign(user_token,APP_SECRET,{algorithm:"HS256"},function(err,token){
            if(!err){
                res.json({loggedIn:true,data:{name:req.user.name},access_token:token});
            }else{
                res.json({loggedIn:false});
            }
        });
  });
module.exports = router;
