var mongoose = require("mongoose");

var Schema = mongoose.Schema; //ORM Layer
var groups = new Schema({
  name:{type:String,required:true},
  owner_id:{type:Schema.Types.ObjectId,ref:"users",required:true},
  members:[{type:Schema.Types.ObjectId,ref:"users"}]
});

mongoose.model("groups",groups);
