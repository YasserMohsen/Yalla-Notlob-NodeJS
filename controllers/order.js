var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});
var validator = require("validator");
var mongoose = require("mongoose");

router.get("/",function(request,response){
  mongoose.model("orders").find({owner_id:request.user_id},function(err,orders){
    if(!err){
      response.json({status:true,orders:orders});
    }else{
      console.log("aaaa");
      response.json({status:false});
    }
  })
});

router.post("/",postMiddleware,function(request,response){
  var name = validator.escape(request.body.name);
  var restaurant = validator.escape(request.body.restaurant);
  // var menu = validator.escape(request.body.menu);
  var invited = validator.escape(request.body.invited);
  //******************validation*******************************
  var errors = [];
  //1.validate name
  if(validator.isEmpty(name)){
    errors.push("Please choose a name");
  }
  //2.validate restaurant
  if(validator.isEmpty(restaurant)){
    errors.push("Please enter a restaurant name");
  }
  //3.validate invited
  if(validator.isEmpty(invited)){
    errors.push("Please invite a friend or a group of friends");
  }
  //***********************************************************
  var invited_type = invited.for;
  var invited_id = mongoose.Types.ObjectId(invited.id);
  if(invited_type === "group" || invited_type === "user"){
    mongoose.model(invited_type+"s").findOne({"_id":invited_id},function(err,result){
      if(!result || err){
        errors.push("Invalid invited group or member");
      }
      if(errors.length > 0){
        response.json({status:false,errors:errors});
      }else{
        //add order in DB
        var orderModel = mongoose.model("orders");
        var order = new orderModel({owner_id:request.user_id,name:name,restaurant:restaurant,menu:menu,invited_members:invited});
        order.save(function(err,new_order){
          if(!err){
            response.json({status:true,order:new_order});
          }else{
            console.log(err);
            response.json({status:false,errors:["System Error! Come back later"]});
          }
        })
      }
    })
  }else{
    errors.push("Invalid group or friend");
    response.json({status:false,errors:errors});
  }
});

router.put("/",function(request,response){

});

router.delete("/",function(request,response){

});

module.exports = router;
