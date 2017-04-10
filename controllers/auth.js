var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});
var fs = require('fs');
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
  dest:__dirname + "/../public/profile",
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
//base64 upload image

//////////////////////************************FACEBOOK******************************////////////////////////
var facebookRouter = require("./facebook");
router.use("/facebook",facebookRouter);
//////////////////////************************FACEBOOK******************************////////////////////////

//////////////////////************************GOOGLE******************************////////////////////////
var facebookRouter = require("./google");
router.use("/google",facebookRouter);
//////////////////////************************GOOGLE******************************////////////////////////

router.post("/login",postMiddleware,function(request,response){
  var email = validator.escape(request.body.email);
  var password = request.body.password;
  if(!validator.isEmail(email) || validator.isEmpty(password)){
    response.json({loggedIn:false});
  }else{
    //check in DB
    mongoose.model("users").findOne({email:email},{password:true},function(err,user){
      if(err || !user || user.password == 'undefined'){
        response.json({loggedIn:false});
    // check bcrypt password ...
      }else if(bcrypt.compareSync(password,user.password)){
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
  var base64image = request.body.profile || '';
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
  //4.validate image
  var matches = base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if(matches.length != 2){
    errors.push("Invalid Image");
  }else{
    var ext = matches[0];
    var e = ext.split('/')[1];
    if(e != "png" || e != "jpg"){
      errors.push("Invalid Image extension");
    }
    var data = matches[1];
  }
  ////////////////////////////////////////////////
  if(errors.length > 0){
    response.json({loggedIn:false,errors:errors});
  }
  mongoose.model("users").findOne({email:email},{email:true},function(err,user){
    if(!err && user){
      response.json({loggedIn:false,errors:["Email is already exist!"]});
    }else{
      //hashed password
      var salt = bcrypt.genSaltSync();
      var hashedPassword = bcrypt.hashSync(password,salt);
      //upload image
      var buf = new Buffer(data, 'base64');
      var imageName = "pic" + Math.floor(Math.random()*(100000)) + "_" + (+new Date())+'.'+e;
      fs.writeFile('/../public/profile/'+imageName, buf, function(err){
        if(err){
          response.json({loggedIn:false,errors:["Can not upload the image"]});
        }else{
          //create user
          var userModel = mongoose.model("users");
          var user = new userModel({name:name,email:email,password:hashedPassword,avatar:imageName});
          user.save(function(err){
            if(!err){
              response.json({loggedIn:true});
            }else{
              console.log(err);
              response.json({loggedIn:false,errors:["System Error! Come back later"]});
            }
          })
        }
      });
    }
  })
})

module.exports = router;
