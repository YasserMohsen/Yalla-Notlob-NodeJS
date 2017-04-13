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
router.get("/:id",function(request,response){
    mongoose.model("groups").findById(request.params.id).populate({path:'members'}).exec(function(err,group){
    if(err)
    {
      response.json({status:false,error:"retrieve error"});
    }
    else {
      if(!group){
        response.json({status:false,error:"not found group id"});
      }else{
        response.json({status:true,group:group})
      }
    }
  });
});
router.post("/AddMember",postMiddleware,function(request,response){
  var isValid=true;
  var errors=[];
  if (request.body.members.length == 0  && !(isArray(request.body.members)))
  {
      response.json({status:true,error:"* Group Members Required"});
  }else {
    // check if members are friends
    mongoose.model("users").findOne({_id:request.user_id},{friends:true},function(err,userFriends){
     if(!err)
      {
        var isFriends=true;
        request.body.members.forEach(function(Gmember){
          if(!userFriends.includes(Gmember))
          {
            isFriends=false;
          }
        });
        if(!isFriends)
        {
          errors.push(" * Invalid Group member");
          isValid=false;
        }
      }
      else {
        response.json({status:false,error:err});
      }
    });
    // group owner not one of the members
    if(request.body.members.includes(request.user_id))
    {
      errors.push(" * Invalid Group Member");
      isValid=false;
    }
    // RepeatedMembers in group
      var RepeatedMemebers={};
      for(var i = request.body.members.length; i--; ){
        RepeatedMemebers[members[i]] = 0;
      }

      request.body.members.forEach(function(member){
        RepeatedMemebers[member]+=1;
      });

      if(Math.max.apply(null,Object.values(RepeatedMemebers))>1){
        errors.push(" * Repeated Group Member");
        isValid=false
      }

      if(isValid)
      {
          response.json({status:true});
      }
      else {
        response.json({status:false,error:errors});
      }
  }

});

router.post("/",postMiddleware,function(request,response){
  var isValid=true;
  var errors=[];
  if (!request.body.group_name)
  {
    errors.push(" * Group Name Required");
    isValid=false;
  }

  if (request.body.members &&  !(isArray(request.body.members)) && request.body.members.length == 0 )
  {
    errors.push(" * Group Memebrs Required");
    isValid=false;
  }
  // reject RepeatedMembers in group
  var RepeatedMemebers={};
  for(let i = 0 ; i < request.body.members.length ; i++ ){
      if( RepeatedMemebers.hasOwnProperty(request.body.members[i])){
         RepeatedMemebers[request.body.members[i]] += 1;
      }else{
        RepeatedMemebers[request.body.members[i]] = 0;
      }
  }
  for(let i = 0 ; i < request.body.members.length ; i++ ){
    if(RepeatedMemebers[request.body.members[i]]>0){
      console.log('repeated member');
      errors.push(" * Repeated Group Member");
      isValid=false;
      break
    };
  }
  if(isValid)
  {
    var groupName=validator.escape(request.body.group_name);
    //validate duplicated owned group name
    mongoose.model('groups').find({name:groupName,owner_id:request.user_id},{},function(err,output){
      if(err){
        response.json({status:false,error:err});
      }else{
        if(output.length != 0 ){
          console.log(output,'output')
            response.json({status:false,error:["Duplicated owned group name"]});
        }else{
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
      }
    })
   }else{
    response.json({status:false,error:errors});
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
