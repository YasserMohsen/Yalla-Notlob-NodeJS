var express=require('express');
var bodyParser=require('body-parser');
var mongoose=require("mongoose");
var validator = require("validator");
var postMiddleware=bodyParser.urlencoded({extended:false});
var router=express.Router();

router.get("/friends",function(request,response){
if(request.user_id)
{
  mongoose.model("users").findOne({_id:request.user_id},{friends:true},function(err,userFriends){
    if(!err && userFriends)
    {
      mongoose.model("users").populate(user,{path:'friends'},function(err,user_friends){
        response.json({status:true,friends:user_friends});
      });
    }
    else {
      response.json({status:false,error:"No Friends"});
    }
  });
}
else {
  response.json({status:false,error:" Not Permitted"});
}
});

router.put("/friends",postMiddleware,function(request,response){
  if (request.body.friendID != request.user_id)
  {
    mongoose.model("users").findOne({_id:request.body.friendID},{},function(err,friend){
      if(!err && friend)
      {
        mongoose.model("users").findOne({_id:request.user_id},{_id:false,friends:true},function(err,userFriends){
          if(!userFriends.friends.includes(request.body.friendID))
          {
            mongoose.model("users").update({_id:request.body.id},{$push:{friends:request.body.friendID}},function(err,user){
              if(!err)
              {
                response.json({status:true,friendData:friend});
              }else {
                response.json({status:false,error:err});
               }
             });
          }
          else {
            response.json({status:false,error:" *Is Already Friend"});
          }
        });
      }
      else {
        response.json({status:false,error:" *User Is not Exist"});
      }
    });
  }
  else {
    response.json({status:false,error:" *Not Permitted"});
  }
});

router.delete("/friends",function(request,response){
  if(request.body.friendID)
  {
    mongoose.model("users").findOne({_id:request.user_id},{_id:false,friends:true},function(err,userFriends){
      if(userFriends.friends.includes(request.body.friendID))
      {
          mongoose.model("users").update({_id:request.user_id},{$pull:{friends:request.body.friendID}},function(err){
          if(!err){

            response.json({status:true});
          }
          else {
            response.json({status:false,error:err});
          }
        });
      }
      else {
        response.json({status:false,error:" Not A Friend"});
      }
    });
  }
  else {
    response.json({isDone:false,err:" *Invalid Friend ID"});
  }
});
module.exports=router;
