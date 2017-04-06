var express=require('express');
var bodyParser=require('body-parser');
var mongoose=require("mongoose");
var isArray=require('validate.io-array');
var postMiddleware=bodyParser.urlencoded({extended:false});
var router=express.Router();

router.get("/",function(request,response){
    mongoose.model("groups").find({owner_id:request.user_id},{},function(err,ownedgroups){
    if(err)
    {
      console.log(ownedgroups);
      response.json({status:false,error:err});
    }
    else {
      mongoose.model("groups").find({members:request.user_id},{},function(err,joinedgroups){
        if(!err)
        {
          console.log(joinedgroups);
          response.json({status:true,ownedGroups:ownedgroups,joinedGroups:joinedgroups});
        }
        else {
          response.json({status:false});
        }
      });
    }
  });
});

router.post("/",postMiddleware,function(request,response){
  if(request.body.group_name && request.body.members && isArray(request.body.members))
  {
    var UserModel=mongoose.model("groups");
    var group=new UserModel({name:request.body.group_name,owner_id:request.user_id,members:request.body.members});
    group.save(function(err){
        if(!err){
          response.json({status:true});
        }
        else {
          response.json({status:false});
        }
      });
  }
  else {
    response.json({status:false});
  }
});

router.put("/",postMiddleware,function(request,response){
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

router.get("/search/name/:value",function(request,response){
  var value = request.params.value;
  var query = {owner_id:request.user_id};
  query[name] = new RegExp("%"+value+"%");
  mongoose.model("groups").find(query,function(err,groups){
    if(!err){
      response.json(groups);
    }else{
      console.log(err);
      response.json("error");
    }
  })
});

module.exports=router;
