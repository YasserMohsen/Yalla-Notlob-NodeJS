var mongoose = require("mongoose");

var Schema = mongoose.Schema; //ORM Layer
var users = new Schema({
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  avatar:String,
  access_token:String,
  friends:[{type:Schema.Types.ObjectId,ref:"users"}]
})

mongoose.model("users",users);
