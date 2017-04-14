var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});
var validator = require("validator");
var mongoose = require("mongoose");
var fs = require('fs');

//GET owned and invited orders ...
router.get("/",function(request,response){
  mongoose.model("orders").find({},{meals:false}).populate('invited_group').exec(function(err,orders){
    // console.log("ORDERS: "+orders);
    if(!err && orders){
        var owned_orders = [];
        var invited_user_orders = [];
        var invited_group_orders = [];
        for(var i = 0;i<orders.length;i++){
            order = orders[i]
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
        };
        invited_orders = invited_user_orders.concat(invited_group_orders);
        response.json({status:true,owned_orders:owned_orders,invited_orders:invited_orders});
    }else{
        console.log("get orders error");
        response.json({status:false});
    }
  })
  // mongoose.model("orders").find({owner_id:request.user_id},{meals:false},function(err,owned_orders){
  // mongoose.model("orders").find({invited_user:request.user_id},{meals:false},function(err,invited_user_orders){
  // mongoose.model("orders").find({$and:[{invited_group:{$exists:true}},{owner_id:{$ne:request.user_id}}]},{meals:false}).populate({path:'invited_group',match:{'members':{$elemMatch:{$in:[request.user_id]}}}}).exec(function(err,invited_group_orders){
});

//GET an order details ...
router.get("/:id",function(request,response){
  mongoose.model("orders").findOne({_id:request.params.id})
  .populate({path:'meals.user_id',select:'name avatar'})
  .populate({path:'invited_user',select:'name avatar'})
  .populate({path:'invited_group'})
  .populate({path:'invited_group.members',select:'name avatar'})
  .exec(function(err,order_details){
    if(!err){
      response.json({status:true,order:order_details});
    }else{
      console.log("get specific order error");
      response.json({status:false});
    }
  })
});

//POST an order ...
router.post("/",postMiddleware,function(request,response){
  console.log(request.headers);
  var name = validator.escape(request.body.name || '');
  var restaurant = validator.escape(request.body.restaurant || '');
  // var menu = validator.escape(request.body.menu);
  var invited_id = validator.escape(request.body.invited_id || '');
  var invited_type = validator.escape(request.body.invited_type || '');
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
    mongoose.model(invited_type+"s").findOne({"_id":invited_id},function(err,result){
      if(!result || err){
          errors.push("Invalid invited group or member");
          response.json({status:false,errors:errors});
      }else{
          //prepare the order to save
          var orderModel = mongoose.model("orders");
          var orderObject = {owner_id:request.user_id,name:name,restaurant:restaurant};
          orderObject["invited_"+invited_type] = invited_id;
          //validate this user to add this friend or group
          if(invited_type === "group"){
              if(String(result.owner_id) !== request.user_id){
                  errors.push("Invalid invited group");
                  response.json({status:false,errors:errors});
              }else{
                  //save in database
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
          }else{
              mongoose.model("users").findOne({_id:request.user_id},function(err,user){
                  if(!err && user){
                      if(user.friends.indexOf(invited_id) < 0){
                          errors.push("Invalid invited friend");
                      }
                  }else{
                      errors.push("logged user not found");
                  }
                  if(errors.length > 0){
                      response.json({status:false,errors:errors});
                  }else{
                      //save order in database
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

//submit owned order ...
router.put("/finish/:id",function(request,response){
    mongoose.model("orders").findById(request.params.id,function(err,order){
        if(err){
            response.json({status:false});
        }else{
            if(order && request.user_id === (order.owner_id).toString()){
                order.checkout = true;
                order.save(function(err,order){
                    if(err){
                        response.json({status:false});
                    }
                    response.json({status:true});
                })
            }else{
              response.json({status:false});
            }
        }
    })
});

//DELETE owned order ...
router.delete("/:id",function(request,response){
    mongoose.model("orders").findById(request.params.id,function(err,order){
        if(err){
            console.log("error 1");
            response.json({status:false});
        }else{
            if(order && request.user_id === (order.owner_id).toString()){
                order.remove(function(err){
                  if(err){
                      console.log("error 2");
                      response.json({status:false});
                  }else{
                      response.json({status:true});
                  }
                })
            }else{
                console.log("error 3");
                response.json({status:false});
            }
        }
    })
});

//POST meal in an owned or invited order ...
router.post("/:id/meal",postMiddleware,function(request,response){
    //meal details
    var item = validator.escape(request.body.item);
    var price = validator.escape(request.body.price);
    var amount = validator.escape(request.body.amount) || "1";
    var comment = validator.escape(request.body.comment);
    var base64image = request.body.profile || '';
    //******************validation*******************************
    var errors = [];
    //1.validate item name
    if(validator.isEmpty(item)){
        errors.push("Please type an item");
    }
    //2.validate price
    if(validator.isEmpty(price)){
        errors.push("Please enter your item price");
    }
    if(Number.isNaN(price * 1) || (price * 1) <= 0){
        errors.push("Invalid price");
    }
    //3.validate invited
    if((amount * 1) <= 0 || !Number.isInteger(amount * 1)){
        errors.push("Invalid amount");
    }
    //4.validate image
    var matches = base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/) || [];
    if(matches.length != 3){
      errors.push("Invalid Image");
    }else{
      var ext = matches[1];
      var e = ext.split('/')[1];
      console.log('EXT: ' + e)
      console.log(e !== "png" || e !== "jpg")

      if(e !== "png" && e !== "jpg" && e !== "jpeg"){
        errors.push("Invalid Image extension");
      }
      var data = matches[2];
    }
    if(errors.length > 0) response.json({status:false,errors:errors});
    //***********************************************************
    mongoose.model("orders").findById(request.params.id).exec(function(err,order){
        if(err){
            response.json({status:false,errors:["System Error! Come back later"]});
        }else{
            if(order){
              //upload image
              var buf = new Buffer(data, 'base64');
              var imageName = "pic" + Math.floor(Math.random()*(100000)) + "_" + (+new Date())+'.'+e;
              fs.writeFile('public/profile/'+imageName, buf, function(err){
                if(!err)
                {
                  if(order.owner_id === request.user_id || (typeof order.joined_members !== 'undefined' && (order.joined_members.indexOf(request.user_id) > -1))){
                      var meal = {user_id:request.user_id,item:item,price:price,amount:amount,comment:comment,menu:"profile/"+imageName};
                      // console.log(meal);
                      order.meals.push(meal);
                      // console.log(order);
                      order.save(function(err,order){
                          if(err){
                              response.json({status:false,errors:["System error"]});
                          }else{
                              response.json({status:true,order:order});
                          }
                      })
                  }else{
                      response.json({status:false,errors:["You are not allowed to add a meal in that order"]});
                  }
                }
                else {
                  response.json({loggedIn:false,errors:["Can not upload the image"]});
                }
              });
            }else{
                response.json({status:false,errors:["Invalid order id"]});
            }
        }
    })
});

// joinded member
router.put("/:order_id",function(request,response){
  if(request.params.order_id)
  {
    mongoose.model("orders").findById(request.params.order_id).populate('invited_group').exec(function(err,order){
        if(err){
            response.json({status:false,error:"System Error! Come back later"});
        }else{
            if(order){
                if(order.invited_group !== 'undefined' && (order.invited_group.members.indexOf(request.user_id) > -1)){
                  mongoose.model("orders").update({_id:request.params.order_id},{$push:{joined_members:request.user_id}},function(err){
                      if(!err){
                        response.json({status:true});
                      }
                      else {
                        response.json({status:false,error:err});
                      }
                    });
                }else{
                    response.json({status:false,errors:[" you are not invited to that order"]});
                }
            }else{
                response.json({status:false,errors:["Invalid order id"]});
            }
        }
    });
  }else{
      response.json({status:false,error:"order id not found"});
  }
});

//DELETE an owned meal from an owned or invited order ...
router.delete("/:order_id/meal/:meal_id",function(request,response){
    mongoose.model("orders").findById(request.params.order_id,function(err,order){
        if(err){
            response.json({status:false,error:"System Error - Cannot Retrieve"});
        }else{
            //check order id existance
            if(!order){
                response.json({status:false,error:"Invalid order id"});
            }else{
                //check meal id existance in the order
                var meals = order.meals;
                var target = -1;
                for (var i = 0; i < meals.length; i++) {
                    if(request.params.meal_id == meals[i]._id){
                        target = i;
                        break;
                    }
                }
                console.log("t: "+target);
                if(target === -1){
                    response.json({status:false,error:"This meal id is not exist in this order"})
                }else{
                    //check permission - meal ownership
                    var target_meal = meals[target];
                    if(target_meal.user_id != request.user_id){
                        response.json({status:false,error:"Your are not allowed to delete this meal"})
                    }else{
                        //You are allowed to DELETE THE MEAL NOW
                        order.meals.splice(i,1);
                        order.save(function(err,order){
                            if(err){
                                response.json({status:false,error:"System Error - Cannot Save"});
                            }else{
                                response.json({status:true,deleted_meal:target_meal});
                            }
                        })
                    }
                }
            }
        }
    })
});

module.exports = router;
