var mongoose = require("mongoose");

var Schema = mongoose.Schema; //ORM Layer
var notifications = new Schema({
  order_id:{type:Schema.Types.ObjectId,ref:"orders",required:true},
  status:{type:Boolean,default:false}, //false = unread
  type:{type:String,required:true},
  text:{type:String},
  time:Date,
  from:{type:Schema.Types.ObjectId,ref:"users",required:true},
  to:{type:Schema.Types.ObjectId,ref:"users",required:true}
})

mongoose.model("notifications",notifications);
