var express = require("express");
var server = express();
var fs = require("fs");
//jwt
var jwt = require("jsonwebtoken");
const APP_SECRET = "F@#e$!%w!&_q@#!z";
//MongoDB connection
var mongoose = require("mongoose");
// var db_host = "localhost:27017/yallaNotlob";
var db_host = "mongodb://yasser:123456@ds153730.mlab.com:53730/yallanotlob";
mongoose.connect(db_host);

//require all files under models folder
fs.readdirSync(__dirname+"/models").forEach(function(file){
  require("./models/"+file);
})
//require all routers
var authRouter = require("./controllers/auth");
var userRouter = require("./controllers/user");
var groupRouter = require("./controllers/group");
var orderRouter = require("./controllers/order");
// var notificationRouter = require("./controllers/notification");

server.use(function(request,response,next){
  response.setHeader("X-XSS-Protection",1);
  response.setHeader("Access-Control-Allow-Origin","*");
  response.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE");
  response.setHeader("Cache-Control","no-cache");
  next();
})

//use routers
server.use("/auth",authRouter);
//check jwt access token
server.use(function(request,response,next){
  // var access_token = request.headers.authorization;
  var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0OTEzOTI2MTEsImV4cCI6MTUyMjkyODYxMSwiYXVkIjoiIiwic3ViIjoiIiwiX2lkIjoiNThlM2NhN2RkNTFiY2UyZGE1MWE2MWFiIn0.5mx-XCG3rn8lCCDt18fKOgA5-sY-Oi9gL8wyQmK35mI";
  jwt.verify(access_token,APP_SECRET,function(err,decoded){
     if(err){
       console.log("error");
       response.status(401);
       response.json("Unauthorized");
     }else{
       console.log("authorized");
       request.user_id = decoded._id;
       next();
     }
   });
});
server.use("/user",userRouter);
server.use("/group",groupRouter);
server.use("/order",orderRouter);
// server.use("/notification",notificationRouter);

//************example of populate "find" result*********************
// server.get("/",function(request,response){
  // mongoose.model("users").find({name:"yyyyyyyyyyyy"},function(err,users){
  //   // response.send(users);
  //   mongoose.model("users").populate(users,{path:'friends'},function(err,populated_users){
  //       response.send(populated_users);
  //   })
  // })
//   mongoose.model("users").find({"email":/^www/i},{},function(err,data){
//     response.json(data);
//   })
// })

server.listen(8090);
