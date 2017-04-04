var express=require('express');
var bodyParser=require('body-parser');
var mongoose=require("mongoose");
var isArray=require('validate.io-array');
var postMiddleware=bodyParser.urlencoded({extended:false});
var router=express.Router();

router.get("/",function(request,response){
  mongoose.model("groups").find({},{},function(err,groups){
    if(!err)
    {
      console.log(groups);
      response.json(groups);
    }
    else {
        response.json({error:err});
    }
  })
});

router.post("/",postMiddleware,function(request,response){
  // valida access token
  //var array = request.body.members.split(',');
  if(request.body.group_name && request.body.owner && request.body.members && isArray(request.body.members))
  {
    var UserModel=mongoose.model("groups");
    var group=new UserModel({name:request.body.group_name,owner_id:request.body.owner,members:request.body.members});
    group.save(function(err){
        if(!err){
          response.json({isDone:true});
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

router.put("/:id",postMiddleware,function(request,response){
// validate access token
if(request.params.id)
 {
  mongoose.model("groups").find({_id:request.params.id},{},function(err,groups){
    if(!err)
    {
      mongoose.model("groups").update({_id:request.params.id},{$set:{name:request.body.group_name,owner_id:request.body.owner,members:request.body.members}},function(err,group){
        if(!err)
        {
          response.json({isDone:true,groupData:group});
        }else {
          response.json({isDone:false});
         }
       });
    }
    else {
      response.json({isDone:false,err:"not found"});
    }
  });
 }
 else {
  response.json({isDone:false});
 }
});

router.delete("/:id",postMiddleware,function(request,response){
// validate access token
console.log(request.params.id);
if(request.params.id)
{
  //mongoose.model("users").find({_id:request.body.id},{},function(err,user){
    //if(!err)
    //{
      mongoose.model("groups").find({_id:request.params.id},{},function(err,group){
        if(!err)
        {
          console.log(group);
          mongoose.model("groups").remove({_id:request.params.id},function(err,group){
            if(!err){
                console.log(group);
              response.json({isDone:true});
            }
            else {
              response.json({isDone:false});
            }
          });
        }
        else {
          response.json({isDone:false,err:"not found"});
        }
      });
    //}else{
    //  response.json({isDone:false});
  //}});
}
else {
    response.json({isDone:false});
  }
});

module.exports=router;
