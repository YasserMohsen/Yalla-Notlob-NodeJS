var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});

var mongoose = require("mongoose");

// var friendsRouter = require("./friends");
// router.use("/friends",friendsRouter);

router.get("/search/:field/:value",function(request,response){
  var field = request.params.field;
  var value = request.params.value;
  var query = {};
  query[field] = new RegExp(value,'i');
  mongoose.model("users").find(query,function(err,data){
    if(!err){
      response.json(data);
    }else{
      console.log(err);
      response.json("errorr");
    }
  })
});

router.get("/activity",function(request,response){
  var user_id= request.user_id
  // var user_id="58e23831be011d1ac61542ad";
  mongoose.model("users").findOne({_id:request.user_id},{_id:false,friends:true}).populate('friends').exec(function(err,userFriends){
    if(!err){
      if(userFriends)
      {
          mongoose.model("orders").find({},{},function(err,Orders){
            if(err)
            {
                response.json({status:false,error:"no"});
            }
            else {
              if(Orders)
              {
                var newOrders=[];
                var joinedOrders=[];
                Orders.forEach(function(order){
                  userFriends.friends.forEach(function(friend){
                    console.log("friend");
                    console.log(friend);
                    console.log(order.owner_id);
                    console.log(friend._id);
                    if(String(order.owner_id) === String(friend._id))
                    {
                        newOrders.push({friendInfo:friend,ownedOrder:order,date:order.date});
                    }
                    else if (order.joined_members.indexOf(String(friend._id)) > -1)
                    {
                        joinedOrders.push({friendInfo:friend,joinedOrder:order,date:order.date});
                    }
                  })
                });
                response.json({status:true,new_Orders:newOrders,joined_Orders:joinedOrders});
              }
              else {
                response.json({status:true,error:"No Activities Found"});
              }
            }
          });
      }
      else {
        response.json({status:true,error:"No Friends Found"});
      }
    }else{
      response.json({status:false,error:"err"});
    }
  });
});

module.exports = router;
