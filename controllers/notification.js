var express=require('express');
var server=express();
var mongoose=require("mongoose");
var validator = require("validator");
var http=require('http');
var httpSERVER=http.createServer(expressServer);
var io=require('socket.io')(httpSERVER);

var OnlineUsers={};

io.on("connection",function(socketClient){
  socketClient.on("NewUser",function(request.user_id){
   OnlineUsers[request.user_id]=socketClient;
  });

  socketClient.on("notify",function(orderID,users){
    var status=true;
    var UserModel=mongoose.model("notifications");
    users.forEach(function(user){
    var notification=new UserModel({order_id:orderID,type:"action",time:new Date(),user_id:user});
    notification.save(function(err){
        if(err){status=false;}
          Object.keys(OnlineUsers).forEach(function(id){
            if(id==user)
            {
                OnlineUsers[user].emit("Invite_user",null);
            }
          });
        });
    });
  if(status)
  {
    response.json({status:true});
  }
  else {
    response.json({status:false});
  }
 });

 socketClient.on("join",function(orderID){
   mongoose.model("orders").findOne({_id:order_id},{_id:false,owner_id:true},function(err,owner){
     if(!err)
     {
        var UserModel=mongoose.model("notifications");
        var notification=new UserModel({order_id:orderID,type:"text",time:new Date(),user_id:owner});
        notification.save(function(err){
            if(!err){
              Object.keys(OnlineUsers).forEach(function(id){
                if(id==owner)
                {
                    OnlineUsers[user].emit("accept_invitation",null);
                }
              });
            }
        });
     }
   });
 });
});

server.get("/",function(request,response){
  mongoose.model("notifications").find({user_id:request.user_id},function(err,userNotifications){
    if (!err)
    {
      response.json({status:true,Notifications:userNotifications});
    }
    else {
      response.json({status:false,error:err});
    }

  });
});
httpSERVER.listen(8090);
