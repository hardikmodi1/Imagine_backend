var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var UserSchema=new Schema({
	email:{type:String,required:true,lowercase:true},
	password:{type:String,required:true,select:false},
	confirmed:{type:Boolean,default:false},
});

module.exports=mongoose.model('User',UserSchema);