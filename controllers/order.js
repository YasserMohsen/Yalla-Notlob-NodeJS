var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});
var validator = require("validator");
var mongoose = require("mongoose");

//get owned and invited orders
router.get("/",function(request,response){
  mongoose.model("orders").find({},{meals:false}).populate('invited_group').exec(function(err,orders){
    if(!err){
        var owned_orders = [];
        var invited_user_orders = [];
        var invited_group_orders = [];
        orders.forEach(function(order){
            if(String(order.owner_id) === request.user_id){
                console.log("owner");
                owned_orders.push(order);
            }else if (String(order.invited_user) === request.user_id) {
                console.log("user invited");
                invited_user_orders.push(order);
            }else if (typeof order.invited_group !== 'undefined' && (order.invited_group.members.indexOf(request.user_id) > -1)) {
                console.log("group invited");
                invited_group_orders.push(order);
            }
        });
        invited_orders = invited_user_orders.concat(invited_group_orders);
        response.json({status:true,owned_orders:owned_orders,invited_orders:invited_orders});
    }else{
        console.log("get orders error");
        response.json({status:false});
    }
  })
  // mongoose.model("orders").find({owner_id:request.user_id},{meals:false},function(err,owned_orders){
  //     mongoose.model("orders").find({invited_user:request.user_id},{meals:false},function(err,invited_user_orders){
  //         mongoose.model("orders").find({$and:[{invited_group:{$exists:true}},{owner_id:{$ne:request.user_id}}]},{meals:false}).populate({path:'invited_group',match:{'members':{$elemMatch:{$in:[request.user_id]}}}}).exec(function(err,invited_group_orders){
});
//get an order details
router.get("/:id",function(request,response){
  mongoose.model("orders").findOne({_id:request.params.id}).populate({path:'meals.user_id',select:'name avatar'}).exec(function(err,order_details){
    if(!err){
      response.json({status:true,order:order_details});
    }else{
      console.log("get specific order error");
      response.json({status:false});
    }
  })
});

router.post("/",postMiddleware,function(request,response){
  var name = validator.escape(request.body.name);
  var restaurant = validator.escape(request.body.restaurant);
  // var menu = validator.escape(request.body.menu);
  var invited_id = validator.escape(request.body.invited_id);
  var invited_type = validator.escape(request.body.invited_type);
  // var invited = {for:"user",id:"58e235e67a12b018feb4d862"};
  // var invited_id = "58e6cfa0b85cdd420ad62434";
  // var invited_type = "user";
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
  if(!validator.isLength(invited_id,24)){
    errors.push("Please invite a friend or a group of friends");
  }
  //***********************************************************
  if(invited_type === "group" || invited_type === "user"){
    console.log(invited_id);
    mongoose.model(invited_type+"s").findOne({"_id":invited_id},function(err,result){
      if(!result || err){
          console.log("Result: "+ result);
          errors.push("Invalid invited group or member");
          response.json({status:false,errors:errors});
      }else{
          //validate this user to add this friend or group
          if(invited_type === "group"){
              if(String(result.owner_id) !== request.user_id){
                  errors.push("Invalid invited group");
                  response.json({status:false,errors:errors});
              }
          }else{
              console.log("ssss" + request.user_id);
              mongoose.model("users").findOne({_id:request.user_id},function(err,user){
                  if(!err && user){
                      console.log("Hereee "+user);
                      if(user.friends.indexOf(invited_id) < 0){
                          errors.push("Invalid invited friend");
                      }
                  }else{
                      errors.push("logged user not found");
                  }
                  if(errors.length > 0){
                    response.json({status:false,errors:errors});
                  }else{
                    //add order in DB
                    var orderModel = mongoose.model("orders");
                    var orderObject = {owner_id:request.user_id,name:name,restaurant:restaurant};
                    orderObject["invited_"+invited_type] = invited_id;
                    var order = new orderModel(orderObject);
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
          }
      }

    })
  }else{
    errors.push("Invalid group or friend");
    response.json({status:false,errors:errors});
  }
});

router.put("/finish/:id",function(request,response){

});

router.delete("/",function(request,response){

});

module.exports = router;
