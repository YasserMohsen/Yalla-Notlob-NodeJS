module.exports= function (httpSERVER){
var express=require('express');
var server = express();
var http=require('http');
var io=require('socket.io')(httpSERVER);
var jwt = require("jsonwebtoken");
const APP_SECRET = "F@#e$!%w!&_q@#!z";
var mongoose=require("mongoose");
var validator = require("validator");
var router=express.Router();
var OnlineUsers={};

io.on("connection",function(socketClient){
  // passe accessToken not user id
  socketClient.on("join",function(user_id){
    /*var user_id;
   jwt.verify(accessToken,APP_SECRET,function(err,decoded){
       if(!err){
          user_id=decoded._id;
       }
     });*/
   OnlineUsers[user_id]=socketClient;
   Object.keys(OnlineUsers).forEach(function(key){
      OnlineUsers[key].emit("online_users",Object.keys(OnlineUsers));
    });
  });
  // passe accessToken not user id
  socketClient.on("notify",function(notify_object){
    /*var user_id;
   jwt.verify(notify_object.accessToken,APP_SECRET,function(err,decoded){
       if(!err){
          user_id=decoded._id;
       }
     });*/
    var status;
    console.log(notify_object.users.length);
    console.log(notify_object.orderID);
    var UserModel=mongoose.model("notifications");
    notify_object.users.forEach(function(user){
    var notification=new UserModel({order_id:notify_object.orderID,type:"action",from:notify_object.user_id,to:user});
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
        var notification=new UserModel({order_id:notify_object.orderID,type:"text",text:notify_object.state,time:new Date(),from:notify_object.user_id,to:owner});
        notification.save(function(err){
            if(!err){
                if(OnlineUsers[owner])
                {
                    if(notify_object.state === "accepted")
                    {
                      OnlineUsers[owner].emit("accept_invitation",notify_object.orderID);
                    }
                    else {
                      OnlineUsers[owner].emit("reject_invitation",notify_object.orderID);
                    }
                    OnlineUsers[owner].emit("is_Recieved",{status:true,error:"message send to user"});
                }
              var state='';
              if(notify_object.state === "accepted"){
                state="joined"
              }
              else {
                state="canceled"
              }
              mongoose.model("notifications").update({_id:notify_object.notificationID},{$set:{status:true,type:"text",text:state}},function(err){
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

  socketClient.on("updateToSeen",function(notificationID){
    if(notificationID)
    {
      mongoose.model("notifications").update({_id:notificationID},{$set:{status:true}},function(err){
        if(!err)
        {
          OnlineUsers[user_id].emit("is_Recieved",{status:true,response:" notification updated"});
        }
        else {
          OnlineUsers[user_id].emit("is_Recieved",{status:false,error:err});
        }
      });
    }else {
      OnlineUsers[user_id].emit("is_Recieved",{status:false,error:err});
    }
  });

  socketClient.on("disconnect",function(user_id){
    delete OnlineUsers[user_id];
    console.log(Object.keys(OnlineUsers));
  });

});

router.get("/",function(request,response){
  // change request.user_id
  var userID="58e235e67a12b018feb4d862";
  mongoose.model("notifications").find({to:userID}).sort({time:-1}).populate('to','name').populate('from','name').populate('order_id','name').limit(5).exec(function(err,userNotifications){
    if (!err)
    {
      response.json({status:true,Notifications:userNotifications});
    }
    else {
      response.json({status:false,error:err});
    }
  });
});

router.get("/viewall",function(request,response){
  // change request.user_id
  var userID="58e235e67a12b018feb4d862";
  mongoose.model("notifications").find({to:userID}).sort({time:-1}).populate('to','name').populate('from','name').populate('order_id','name').exec(function(err,userNotifications){
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
