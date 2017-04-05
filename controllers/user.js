var express = require("express");
var router = express.Router();

var bodyParser = require("body-parser");
var postMiddleware = bodyParser.urlencoded({extended:true});

var mongoose = require("mongoose");

// var friendRouter = require("./friend");
// router.use("/friend",friendRouter);

router.get("/search/:field/:value",function(request,response){
  var field = request.params.field;
  var value = request.params.value;
  var query = {};
  query[field] = new RegExp("^"+value);
  mongoose.model("users").find(query,function(err,data){
    response.json(data);
    if(err){
      console.log(err);
      response.json("error");
    }
  })
});

module.exports = router;
