module.exports= function (httpSERVER){
var express=require('express');
var server = express();
var http=require('http');
var io=require('socket.io')(httpSERVER);
var mongoose=require("mongoose");
var validator = require("validator");
var router=express.Router();
var OnlineUsers={};

io.on("connection",function(socketClient){

  socketClient.on("join",function(user_id){
    console.log("in Join");
   OnlineUsers[user_id]=socketClient;
   Object.keys(OnlineUsers).forEach(function(key){
      OnlineUsers[key].emit("online_users",Object.keys(OnlineUsers));
      console.log(OnlineUsers[key]);
    });
  });

  socketClient.on("notify",function(notify_object){
    console.log("in notify");
    console.log(notify_object.users);
    console.log(notify_object.orderID);
    var status=true;
    var UserModel=mongoose.model("notifications");
    notify_object.users.forEach(function(user){
  //  var notification=new UserModel({order_id:orderID,type:"action",time:new Date(),user_id:user});
    //notification.save(function(err){
      //  if(err){status=false;}
          Object.keys(OnlineUsers).forEach(function(id){
            if(id==user)
            {
                OnlineUsers[user].emit("Invite_user",notify_object.orderID);
            }
          });
    //    });
    });
  if(status)
  {
    response.json({status:true});
  }
  else {
    response.json({status:false});
  }
 });
/*
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
 });*/
});

router.get("/",function(request,response){
  // limit by 5
  // get last
  // change request.user_id
  var userID="58e23831be011d1ac61542ad";
  mongoose.model("notifications").find({user_id:userID},function(err,userNotifications){
    if (!err)
    {
      response.json({status:true,Notifications:userNotifications});
    }
    else {
      response.json({status:false,error:err});
    }
  });
});
return router;
}
