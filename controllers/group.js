var express=require('express');
var bodyParser=require('body-parser');
var mongoose=require("mongoose");
var isArray=require('validate.io-array');
var validator = require("validator");
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
  var isValid=true;
  var errors=[];
  if (!request.body.group_name)
  {
    errors.push(" * Group Name Required");
    isValid=false;
  }

  if (request.body.members.length == 0  && isArray(request.body.members))
  {
    errors.push(" * Check Group Members");
    isValid=false;
  }else {
     if(request.body.members.includes(request.user_id))
      {
        errors.push(" * Invalid Group Member");
        isValid=false;
      }

      var RepeatedMemebers={};
      for(var i = request.body.members.length; i--; ){
        RepeatedMemebers[members[i]] = 0;
      }

      request.body.members.forEach(function(member){
        RepeatedMemebers[member]+=1;
      });

      if(Math.max.apply(null,Object.values(RepeatedMemebers))>1){
        errors.push(" * Repeated Group Members");
        isValid=false;
      }
  }

  if(isValid)
  {
    var groupName=validator.escape(request.body.group_name);
    var UserModel=mongoose.model("groups");
    var group=new UserModel({name:groupName,owner_id:request.user_id,members:request.body.members});
    group.save(function(err){
        if(!err){
          response.json({status:true,newGroup:group});
        }
        else {
          response.json({status:false,error:err});
        }
      });
   }
});

router.put("/:groupID",postMiddleware,function(request,response){
if(request.params.groupID)
 {
   var isValid=true;
   var errors=[];
   if (!request.body.group_name)
   {
     errors.push(" * Group Name Required");
     isValid=false;
   }
   if (request.body.members.length == 0 && isArray(request.body.members))
   {
     errors.push(" * Check Group Members");
     isValid=false;
   }


  if(isValid)
  {
    var groupName=validator.escape(request.body.group_name);
    mongoose.model("groups").find({_id:request.params.groupID},{},function(err,groups){
      if(!err)
      {
        mongoose.model("groups").update({_id:request.params.groupID},{$set:{name:groupName,members:request.body.members}},function(err){
          if(!err)
          {
            response.json({status:true});
          }else {
            response.json({status:false,error:err});
          }
        });
      }
      else {
        response.json({status:false,error:" Group ID not found"});
      }
    });
 }
 else {
   response.json({status:false,error:errors});
 }
}
else {
  response.json({status:false,err:" *Empty Group ID"});
 }
});

router.delete("/:groupID",postMiddleware,function(request,response){
    mongoose.model("groups").findById(request.params.groupID,function(err,group){
        if(err){
            response.json({status:false,error:"System Retrieve Error"})
        }else{
            //check group id existance
            if(!group){
                response.json({status:false,error:"Group id not found"});
            }else{
                //check delete permission - group ownership
                if(request.user_id != group.owner_id){
                    response.json({status:false,error:"Not allowed"});
                }else{
                    //remove group
                    group.remove(function(err){
                        if(err){
                            response.json({status:false,error:"System Save Error"})
                        }else{
                            response.json({status:true});
                        }
                    })
                }
            }
        }
    })
})

router.get("/search/name/:value",function(request,response){
  var value = request.params.value;
  var query = {owner_id:request.user_id};
  query[name] = new RegExp(value);
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
