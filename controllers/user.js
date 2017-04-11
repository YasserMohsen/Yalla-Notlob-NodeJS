var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});

var mongoose = require("mongoose");

var friendsRouter = require("./friends");
router.use("/friends",friendsRouter);

router.get("/search/:field/:value",function(request,response){
  var field = request.params.field;
  var value = request.params.value;
  var query = {};
  query[field] = new RegExp(value);
  mongoose.model("users").find(query,function(err,data){
    if(!err){
      response.json(data);
    }else{
      console.log(err);
      response.json("error");
    }
  })
});

router.get("/",function(request,response){
  var newOrders=[];
  var joinedOrders=[];
  // change request.user_id
  var user_id="58e23831be011d1ac61542ad";
  mongoose.model("users").findOne({_id:user_id},{_id:false,friends:true}).populate('friends').exec(function(err,userFriends){
    if(!err){
      if(userFriends)
      {
        userFriends.friends.forEach(function(friend){
          // find owned orders  and joined orders for each user friend
          console.log(friend);
          mongoose.model("orders").find({},{},function(err,Orders){
            if(!err)
            {
              if(Orders)
              {
                Orders.forEach(function(order){
                  if(order.owner_id === friend._id)
                  {
                    newOrders.push({friendInfo:friend,ownedOrders:ownedOrders});
                  }
                  else if (order.joined_members.includes(friend._id))
                   {
                      joinedOrders.push({friendInfo:friend,joinedOrders:joinedOrders});
                  }
                });
                    response.json({status:true,new_Orders:newOrders,joined_Orders:joinedOrders});
              }
              else {
                  response.json({status:false,error:"No orders Found"});
              }
            }
            else {
              response.json({status:false,error:err});
            }
          });
        });
      }
      else {
        response.json({status:false,error:"No Friends Found"});
      }
    }else{
      response.json({status:false,error:err});
    }
  });
});

module.exports = router;
