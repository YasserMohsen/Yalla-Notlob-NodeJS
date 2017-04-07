var express=require('express');
var expressServer=express();
var mongoose=require("mongoose");
var validator = require("validator");
var http=require('http');
var httpSERVER=http.createServer(expressServer);
var io=require('socket.io')(httpSERVER);

var users={};

io.on("connection",function(socketClient){
  socketClient.on("join",function(request.user_id){
   users[request.user_id]=socketClient;
  });

  socketClient.on("notify",function(orderID,users){
    var UserModel=mongoose.model("notifications");
    var notification=new UserModel({order_id:orderID,user_id:users});
  });
});
