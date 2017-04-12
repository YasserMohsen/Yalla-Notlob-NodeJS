var express = require("express");
var server = express();
var http=require('http');
var httpSERVER=http.createServer(server);
var io=require('socket.io')(httpSERVER);//
var fs = require("fs");
var bodyParser = require("body-parser");
//jwt
var jwt = require("jsonwebtoken");
const APP_SECRET = "F@#e$!%w!&_q@#!z";
//MongoDB connection
var mongoose = require("mongoose");
var db_host = "localhost:27017/yallaNotlob";
// var db_host = "mongodb://yasser:123456@ds153730.mlab.com:53730/yallanotlob";
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
var friendsRouter = require("./controllers/friends");
var notificationRouter = require("./controllers/notification")(httpSERVER);

server.use(function(request,response,next){
  response.setHeader("X-XSS-Protection",1);
  response.setHeader('Access-Control-Allow-Headers','Content-Type,authorization');
  response.setHeader("Access-Control-Allow-Origin","*");
  response.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE");
  response.setHeader("Cache-Control","no-cache");
  
  if(request.method != 'OPTIONS'){
    next();
    console.log('is optins req')
  }else{
    response.status(200);
    response.send('true');
  }  
})
server.use(express.static('public'))
// add to accept json in request body
server.use(bodyParser.json());
//use routers
server.use("/auth",authRouter);
//check jwt access token
server.use(function(request,response,next){
  var access_token = request.headers.authorization;
  // yasser //
  // var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0OTE1MjM3MzMsImV4cCI6MTUyMzA1OTczMiwiYXVkIjoiIiwic3ViIjoiIiwiX2lkIjoiNThlNmNmNDhiODVjZGQ0MjBhZDYyNDMwIn0.x1NqlQbkZV1rVYB_KpzSTm-wlZzOpo1Ec6oo2QfcNn4";
  //hassan // var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0OTE1MjM3MzMsImV4cCI6MTUyMzA1OTczMiwiYXVkIjoiIiwic3ViIjoiIiwiX2lkIjoiNThlNmNmNDhiODVjZGQ0MjBhZDYyNDMxIn0.k_E-gA6STkPZmnTItoMmqS59PnX-289uidq8UZD6a8E";
  // var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0OTE1MjM3MzMsImV4cCI6MTUyMzA1OTczMiwiYXVkIjoiIiwic3ViIjoiIiwiX2lkIjoiNThlNmNmNzJiODVjZGQ0MjBhZDYyNDMxIn0.V5gwPGwFJvDZRIdq1C8S8alk305zHCmyuAspkdHi4sE";
  //abdo // var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0OTE1MjM3MzMsImV4cCI6MTUyMzA1OTczMiwiYXVkIjoiIiwic3ViIjoiIiwiX2lkIjoiNThlNmNmNDhiODVjZGQ0MjBhZDYyNDMyIn0.tBudv-fd9RGK4rTdnHlmtWS5opl2i7BOO4t_q-lwbQE";
  //ahmed // var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0OTE1MjM3MzMsImV4cCI6MTUyMzA1OTczMiwiYXVkIjoiIiwic3ViIjoiIiwiX2lkIjoiNThlNmNmNDhiODVjZGQ0MjBhZDYyNDMzIn0.7V8yBzktlrigUaCkHsT0GR2ubYiuMZpGDqkjxFB460M";
  //mostafa // var access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJpYXQiOjE0OTE1MjM3MzMsImV4cCI6MTUyMzA1OTczMiwiYXVkIjoiIiwic3ViIjoiIiwiX2lkIjoiNThlNmNmNDhiODVjZGQ0MjBhZDYyNDM0In0.0BNAhGllAttPV1tpZ6UmghXuWtGbVd1jCADoEEasL_o";
  jwt.verify(access_token,APP_SECRET,function(err,decoded){
     if(err){
       console.log("error");
       response.status(401);
       response.json("Unauthorized");
     }else{
       console.log("authorized");
       request.user_id = decoded._id;
       console.log(request.user_id);
       next();
     }
   });
});
server.use("/user",userRouter);
server.use("/group",groupRouter);
server.use("/order",orderRouter);
server.use("/friends",friendsRouter);
server.use("/notification",notificationRouter);

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
httpSERVER.listen(8090);
// var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8090;
// var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
//
// server.listen(server_port, server_ip_address, function () {
//   console.log( "Listening on " + server_ip_address + ", port " + server_port )
// });
