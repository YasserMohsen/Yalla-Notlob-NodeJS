var express=require('express');
var bodyParser=require('body-parser');
var mongoose=require("mongoose");
var validator = require("validator");
var postMiddleware=bodyParser.urlencoded({extended:false});
var router=express.Router();

router.get("/",function(request,response){
if(request.user_id)
{
  mongoose.model("users").findOne({_id:request.user_id},{friends:true},function(err,userFriends){
    if(!err && userFriends)
    {
      mongoose.model("users").populate(userFriends,{path:'friends'},function(err,user_friends){
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

router.put("/:friendID",postMiddleware,function(request,response){
  console.log(request.params.friendID , 'test')
  if (request.params.friendID != request.user_id)
  {
    mongoose.model("users").findOne({_id:request.params.friendID},{},function(err,friend){
      if(!err && friend)
      {
        mongoose.model("users").findOne({_id:request.user_id},{_id:false,friends:true},function(err,userFriends){
          if(userFriends && !(userFriends.friends.indexOf(request.params.friendID) > -1))
          {
            mongoose.model("users").update({_id:request.user_id},{$push:{friends:request.params.friendID}},function(err,user){
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

router.delete("/:friendID",function(request,response){
  if(request.params.friendID)
  {
    mongoose.model("users").findOne({_id:request.user_id},{_id:false,friends:true},function(err,userFriends){
      if(userFriends && userFriends.friends.indexOf(request.params.friendID) > -1)
      {
          mongoose.model("users").update({_id:request.user_id},{$pull:{friends:request.params.friendID}},function(err){
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

//search in friends
router.get("/search/:field/:value",function(request,response){
  var field = request.params.field;
  var value = request.params.value;
  var query = {};
  query[field] = new RegExp(value);
  mongoose.model("users").findOne({_id:request.user_id},function(err,user){
    if(!err){
      mongoose.model("users").populate(user,{path:'friends',match:query},function(err,populated_user){
        if(!err){
          response.json(user.friends);
        }else{
          console.log(err);
          response.json("population error");
        }
      });
    }else{
      console.log(err);
      response.json("error");
    }
  })
});
module.exports=router;
