module.exports= function (httpSERVER){
var express=require('express');
var server = express();
var isArray=require('validate.io-array');
var http=require('http');
var io=require('socket.io')(httpSERVER);
var jwt = require("jsonwebtoken");
const APP_SECRET = "F@#e$!%w!&_q@#!z";
var mongoose=require("mongoose");
var validator = require("validator");
var bodyParser=require('body-parser');
var postMiddleware=bodyParser.urlencoded({extended:false});
var router=express.Router();

// *********** socket functions ***********
var OnlineUsers={};

io.on("connection",function(socketClient){

  socketClient.on("join",function(user_id){
  //  var user_id;
  //  jwt.verify(accessToken,APP_SECRET,function(err,decoded){
  //      if(!err){
  //         user_id=decoded._id;
          // console.log("jwt verified");
          OnlineUsers[user_id]=socketClient;
          console.log("Online users hashmap: ");
          console.log(Object.keys(OnlineUsers));
    //    }
    //  });
  });


  socketClient.on("notify",function(members){
    console.log("ON NOTIFY");
    console.log(OnlineUsers);
    if(members && isArray(members))
    {
      members.forEach(function(member){
           OnlineUsers[member].emit("notify_user",true);
      });
    }
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

  socketClient.on("logout",function(user_id){
    // var user_id;
    // jwt.verify(accessToken,APP_SECRET,function(err,decoded){
    //     if(!err){
    //        user_id=decoded._id;
    //     }
    //  });
    console.log("NOW")
    console.log("user id: "+user_id)
    console.log(Object.keys(OnlineUsers))
    console.log(OnlineUsers[user_id])
    delete OnlineUsers[user_id];
    console.log("Online users after disconnect hashmap: ");
    console.log(Object.keys(OnlineUsers));
  });
});

// *********** routes ***********

router.get("/",function(request,response){
  mongoose.model("notifications").find({to:request.user_id}).sort({time:-1}).populate('to','name').populate('from','name').populate({path:'order_id',select:'name restaurant'}).exec(function(err,userNotifications){
    if (!err)
    {
      if(userNotifications)
      {
        var numberOfNotifications=0;
        console.log(userNotifications)
        userNotifications.forEach(function(notification){
          if(notification.status === false)
          {
            ++numberOfNotifications;
          }
        });
        console.log(numberOfNotifications);

        response.json({status:true,Notifications:userNotifications.slice(0, 5),numberOfnotifications:numberOfNotifications});
      }
      else {
        response.json({status:false,error:"no notifications"});
      }
    }
    else {
      response.json({status:false,error:err});
    }
  });
});

router.get("/viewall",function(request,response){
  mongoose.model("notifications").find({to:request.user_id}).sort({time:-1}).populate('to','name').populate('from','name').populate('order_id','name').exec(function(err,userNotifications){
    if (!err)
    {
      response.json({status:true,Notifications:userNotifications});
    }
    else {
      response.json({status:false,error:err});
    }
  });
});

router.post("/",postMiddleware,function(request,response){
  if( request.body.type && request.body.orderID && request.body.members.length != 0  && isArray(request.body.members) )
  {
    var status=true;
    var UserModel=mongoose.model("notifications");
    if (request.body.type === "action")
    {
      request.body.members.forEach(function(member){
      var notification=new UserModel({order_id:request.body.orderID,type:request.body.type,time:new Date(),from:request.user_id,to:member});
      notification.save(function(err){
        if(err)
        {
          status=false;
        }
       });
     });
    }
    else {
      mongoose.model("orders").findOne({_id:request.body.orderID},{},function(err,order){
         if(!err)
         {
            var notification=new UserModel({order_id:request.body.orderID,type:"text",text:request.body.state,time:new Date(),from:request.user_id,to:order.owner_id});
            notification.save(function(err){
                if(!err){
                  status=true;
                }
                else {
                  status=false;
                }
            });
         }else {
           status=false;
         }
      });
    }
  response.json({status:status});
  }
  else {
    response.json({status:false,error:"check empty inputs"});
  }
});
// update user notifications to seen
router.put("/",function(request,response){
  mongoose.model("notifications").update({to:request.user_id,status:false},{$set:{status:true}},{multi:true},function(err){
    if(!err)
    {
      response.json({status:true});
    }
    else {
      response.json({status:false,error:err});
    }
  });
});

// update user notification state
router.put("/:notificationID",postMiddleware,function(){
  if(request.params.notificationID)
  {
    var state='';
    if(request.body.state === "accepted"){
      state="joined"
    }
    else {
      state="canceled"
    }
    mongoose.model("notifications").update({_id:request.params.notificationID},{$set:{type:"text",text:state}},function(err){
      if(!err)
      {
        response.json({status:true});
      }
      else {
        response.json({status:false,error:err});
      }
    });
  }
  else {
    response.json({status:false,error:"notificationID Required"});
  }
});

return router;
}
