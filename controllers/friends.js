var express=require('express');
var bodyParser=require('body-parser');
var mongoose=require("mongoose");
var validator = require("validator");
var postMiddleware=bodyParser.urlencoded({extended:false});
var router=express.Router();
var reWhiteSpace = new RegExp("/^\s*$/");

router.get("/",function(request,response){
//if (reWhiteSpace.test("")) console.log('line is blank');
var value="58e23831be011d1ac61542ad";
if(! reWhiteSpace.test(value))
{
  mongoose.model("users").findOne({_id:value},{friends:true},function(err,user){
    if(!err && user)
    {
      mongoose.model("users").populate(user,{path:'friends'},function(err,user_friends){
        response.json(user_friends);
      });
    }
    else {
      response.json({isDone:false});
    }
  });
}
else {
  response.json({isDone:false});
}
});

router.post("/",postMiddleware,function(request,response){
  // waiting for user id input
  // taking friendID input
  if (! reWhiteSpace.test(request.body.friendID) && request.body.friendID != request.body.id)
  {
    mongoose.model("users").findOne({_id:request.body.friendID},{},function(err,friend){
      if(!err && friend)
      {
        mongoose.model("users").findOne({_id:request.body.id},{_id:false,friends:true},function(err,friends){
          if(!friends.friends.includes(request.body.friendID))
          {
            mongoose.model("users").update({_id:request.body.id},{$push:{friends:request.body.friendID}},function(err,user){
              if(!err)
              {
                response.json({isDone:true,friendData:friend});
              }else {
                response.json({isDone:false});
               }
             });
          }
          else {
            response.json({isDone:false,err:"is Already friend"});
          }
        });
      }
      else {
        response.json({isDone:false,err:"user is not Exist"});
      }
    });
  }
  else {
    response.json({isDone:false,err:"invalid friend id"});
  }
});

router.delete("/:friendID",function(request,response){
  // friendID and user id as inputs
  if(! reWhiteSpace.test(friendID))
  {
    mongoose.model("")
  }
  else {
    response.json({isDone:false,err:"invalid friend id"});
  }
});

//search in friends
router.get("/search/:field/:value",function(request,response){
  var field = request.params.field;
  var value = request.params.value;
  var query = {};
  query[field] = new RegExp("%"+value+"%");
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
