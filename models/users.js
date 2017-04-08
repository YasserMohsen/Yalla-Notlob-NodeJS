var mongoose = require("mongoose");
var searchPlugin = require('mongoose-search-plugin');

var Schema = mongoose.Schema; //ORM Layer
var users = new Schema({
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:String,
  avatar:String,
  friends:[{type:Schema.Types.ObjectId,ref:"users"}],
  facebookId:String
});

mongoose.model("users",users);
