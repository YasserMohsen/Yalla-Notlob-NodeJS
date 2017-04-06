var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});

var mongoose = require("mongoose");

var bcrypt = require("bcrypt");
var crypto = require("crypto");
var validator = require("validator");
//jwt
var jwt = require("jsonwebtoken");
const APP_SECRET = "F@#e$!%w!&_q@#!z";
//upload middleware
var multer = require("multer");
var uploadFileMiddleware = multer({
  dest:__dirname + "/../public/images",
  fileFilter:function(req,file,callback){
    if(file.mimetype == "image/jpeg" || file.mimetype == "image/png"){
      req.fileStatus = "Image uploaded";
      callback(null,true);
    } else {
      req.fileStatus = "Image not uploaded";
      callback(null,false);
    }
  }
});
// add to accept json in request body
router.use(bodyParser.json());


router.post("/login",postMiddleware,function(request,response){
  var email = validator.escape(request.body.email);
  var password = request.body.password;
  if(!validator.isEmail(email) || validator.isEmpty(password)){
    response.json({loggedIn:false});
  }else{
    //check in DB
    mongoose.model("users").findOne({email:email},{password:true},function(err,user){
    // check bcrypt password ...
      if(!err && user && bcrypt.compareSync(password,user.password)){
        //jwt
        var user_token = {_id:user._id};
        jwt.sign(user_token,APP_SECRET,{algorithm:"HS256"},function(err,token){
            if(!err){
                response.json({loggedIn:true,data:{name:user.name},access_token:token});
            }else{
                response.json({loggedIn:false});
            }
        });
      }else{
        response.json({loggedIn:false});
      }
    })
  }
});

//var upload = uploadFileMiddleware.single("avatar");
router.post("/register",postMiddleware,function(request,response){
  var email = validator.escape(request.body.email);
  var password = request.body.password;
  var repassword = request.body.repassword;
  var name = validator.escape(request.body.name);
  //******************validation*******************************
  var errors = [];
  //1.validate name
  if(validator.isEmpty(name)){
    errors.push("Please enter your name");
  }
  //2.validate password
  if(!validator.isLength(password,{min:6, max: undefined})){
    errors.push("Password must be at least 6 charachters");
  }else{
    if(password != repassword){
      errors.push("Password fields are not matching each other!");
    }
  }
  //3.validate email
  if(!validator.isEmail(email)){
    errors.push("Invalid email address!");
  }
  mongoose.model("users").findOne({email:email},{email:true},function(err,user){
    if(!err && user){
      errors.push("Email is already exist!");
    }
    if(errors.length > 0){
      response.json({loggedIn:false,errors:errors});
    }else{
      //hashed password
      var salt = bcrypt.genSaltSync();
      var hashedPassword = bcrypt.hashSync(password,salt);
      //create user
      var userModel = mongoose.model("users");
      var user = new userModel({name:name,email:email,password:hashedPassword});
      user.save(function(err){
        if(!err){
          response.json({loggedIn:true});
        }else{
          console.log(err);
          response.json({loggedIn:false,errors:["System Error! Come back later"]});
        }
      })
    }
  })
})

module.exports = router;
