var mongoose = require("mongoose");

var Schema = mongoose.Schema; //ORM Layer
var orders = new Schema({
  owner_id:{type:Schema.Types.ObjectId,ref:"users",required:true},
  name:{type:String,required:true}, //breakfast or lunch
  restaurant:{type:String,required:true},
  menu:String,
  date:{type:Date,default:Date.now},
  checkout:{type:Boolean,default:false},  //false => still in progress
  invited_group:{type:Schema.Types.ObjectId,ref:'groups'},
  invited_user:{type:Schema.Types.ObjectId,ref:'users'},
  joined_members:[{type:Schema.Types.ObjectId,ref:"users"}],
  meals:[{
    user_id:{type:Schema.Types.ObjectId,ref:"users"},
    item:String,
    price:Number,
    amount:{
      type: Number,
      get: v => Math.round(v),
      set: v => Math.round(v),
      default:1
    },
    comment:String,
    date:{type:Date,default:Date.now}
  }]
})

mongoose.model("orders",orders);
