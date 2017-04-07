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

module.exports = router;
