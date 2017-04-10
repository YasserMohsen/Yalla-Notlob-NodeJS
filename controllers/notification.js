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
   OnlineUsers[user_id]=socketClient;
   Object.keys(OnlineUsers).forEach(function(key){
      OnlineUsers[key].emit("online_users",Object.keys(OnlineUsers));
    });
  });

  socketClient.on("notify",function(notify_object){
    // order content problem (order name and invitor)
    var status;
    console.log(notify_object.users);
    console.log(notify_object.orderID);
    var UserModel=mongoose.model("notifications");
    notify_object.users.forEach(function(user){
    var notification=new UserModel({order_id:notify_object.orderID,type:"action",time:new Date(),user_id:user});
    notification.save(function(err){
      if(!err)
      {
        Object.keys(OnlineUsers).forEach(function(id){
          if(id==user)
          {
              OnlineUsers[user].emit("Invite_user",notify_object.orderID);
              status=true;
              OnlineUsers[user].emit("is_Recieved",status);
          }
        });
      }
      else {
        status=false;
        OnlineUsers[user].emit("is_Recieved",status);
      }
     });
   });
 });

 socketClient.on("respondeInvitation",function(notify_object){
   console.log("in accept");
   var status;
   // user name who acceptted the invitation
   var owner="58e235e67a12b018feb4d862";
  // mongoose.model("orders").findOne({_id:notify_object.orderID},{},function(err,order){
    // if(!err)
     //{
        var UserModel=mongoose.model("notifications");
        var notification=new UserModel({order_id:notify_object.orderID,type:"text",time:new Date(),user_id:owner});
        notification.save(function(err){
            if(!err){
                if(OnlineUsers[owner])
                {
                    if(notify_object.state)
                    {
                      OnlineUsers[owner].emit("accept_invitation",notify_object.orderID);
                    }
                    else {
                      OnlineUsers[owner].emit("reject_invitation",notify_object.orderID);
                    }
                    OnlineUsers[owner].emit("is_Recieved",{status:true,error:"message send to user"});
                }

              mongoose.model("notifications").update({_id:notify_object.notificationID},{$set:{status:true,type:"text"}},function(err){
                if(!err)
                {
                  OnlineUsers[owner].emit("is_Recieved",{status:true,error:" notification updated"});
                }
              });
            }
            else {
              OnlineUsers[owner].emit("is_Recieved",{status:false,error:err});
            }
        });
     //}
  //  });
  });

  socketClient.on("disconnect",function(user_id){
    delete OnlineUsers[user_id];
  })

});

router.get("/",function(request,response){
  // change request.user_id
  var userID="58e23831be011d1ac61542ad";
  mongoose.model("notifications").find({user_id:userID},{sort:{time:-1},limit:5},function(err,userNotifications){
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
