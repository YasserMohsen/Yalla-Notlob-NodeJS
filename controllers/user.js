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
  var userID="58e23831be011d1ac61542ad";
  mongoose.model("users").findOne({_id:userID},{_id:false,friends:true}).populate('friends').exec(function(err,userFriends){
    if(!err && userFriends){
      userFriends.friends.forEach(function(friend){
        // find owned orders
        mongoose.model("orders").find({owner_id:friend._id},{},function(err,ownedOrders){
          if(!err && ownedOrders)
          {
            newOrders.push({friendInfo:friend,ownedOrders:ownedOrders});
          }
        });
        // find joined orders
        mongoose.model("orders").find({joined_members:friend._id},{},function(err,joinedOrders){
          if(!err && joinedOrders)
          {
            joinedOrders.push({friendInfo:friend,joinedOrders:joinedOrders});
          }
        });
      });
      response.json({new_Orders:newOrders,joined_Orders:joinedOrders});
    }else{
      response.json({status:false,error:"No Friends Found"});
    }
  });
});

module.exports = router;
