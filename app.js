var express = require("express");
var server = express();
var fs = require("fs");

//MongoDB connection
var mongoose = require("mongoose");
var db_host = "localhost:27017/yallaNotlob";
mongoose.connect("mongodb://"+db_host);

//require all files under models folder
fs.readdirSync(__dirname+"/models").forEach(function(file){
  require("./models/"+file);
})
//require all routers
//var authRouter = require("./controllers/auth");
//var userRouter = require("./controllers/user");
var groupRouter = require("./controllers/group");
//var orderRouter = require("./controllers/order");
//var notificationRouter = require("./controllers/notification");

server.use(function(request,response,next){
  response.setHeader("Access-Control-Allow-Origin","*");
  response.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE");
  response.setHeader("Cache-Control","no-cache");
  next();
})

//use routers
//server.use("/auth",authRouter);
//server.use("/user",userRouter);
server.use("/group",groupRouter);
//server.use("/order",orderRouter);
//server.use("/notification",notificationRouter);

//************example of populate "find" result*********************
// server.get("/",function(request,response){
//   mongoose.model("users").find({name:"yyyyyyyyyyyy"},function(err,users){
//     // response.send(users);
//     mongoose.model("users").populate(users,{path:'friends'},function(err,populated_users){
//         response.send(populated_users);
//     })
//   })
// })

server.listen(8090);
