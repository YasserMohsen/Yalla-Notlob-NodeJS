var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});

var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var crypto = require("crypto");

var validator = require("validator");

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

router.post("/login",postMiddleware,function(request,response){
  var email = request.body.email;
  var password = request.body.password;
  if(!validator.isEmail(email) || validator.isEmpty(password)){
    response.json({loggedIn:false});
  }else{
    //check in DB
    mongoose.model("users").find({email:email},{password:true},function(err,user){
    // To Using bcrypt ...
      if(!err && user[0] != undefined && bcrypt.compareSync(password,user[0].password)){
        var sha512 = crypto.createHash('sha512');
        var token = sha512.update(+new Date()+" "+Math.random()).digest('hex');
        mongoose.model("users").update({email:email},{$set:{access_token:token}},{},function(err){
          if(!err){
              response.json({loggedIn:true,access_token:token});
          }else{
              response.json({loggedIn:false});
          }
        })
      }else{
        response.json({loggedIn:false});
      }
    })
  }
});

//var upload = uploadFileMiddleware.single("avatar");
router.post("/register",postMiddleware,function(request,response){
  var email = request.body.email;
  var password = request.body.password;
  var repassword = request.body.repassword;
  var name = request.body.name;
  //******************validation*******************************
  var errors = [];
  //validate name
  if(validator.isEmpty(name)){
    errors.push("Please enter your name");
  }
  //validate email
  if(!validator.isEmail(email)){
    errors.push("Invalid email address!");
  }
  mongoose.model("users").find({email:email},{email:true},function(err,user){
    if(!err && typeof user[0] === 'object'){
      response.json({loggedIn:false,errors:["Email is already exist!"]})
    }
  });
  //validate password
  if(!validator.isLength(password,{min:6, max: undefined})){
    errors.push("Password must be at least 6 charachters");
  }else{
    if(password != repassword){
      errors.push("Password fields are not matching each other");
    }
  }
  //************************************************************
  if(errors.length > 0){
    response.json({loggedIn:false,errors:errors});
  }else{
    var salt = bcrypt.genSaltSync();
    var hashedPassword = bcrypt.hashSync(password,salt);
    var userModel = mongoose.model("users");
    var user = new userModel({name:name,email:email,password:hashedPassword});
    user.save(function(err){
      if(!err){
        response.json({loggedIn:true});
      }else{
        console.log(err);
        response.json({loggedIn:false,errors:["System Error! come back later"]});
      }
    })
  }
})

module.exports = router;
