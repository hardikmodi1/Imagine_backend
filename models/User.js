var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';
import * as bcrypt from 'bcryptjs';

var UserSchema=new Schema({
	email:{type:String,required:true,lowercase:true},
	password:{type:String,required:true},
	confirmed:{type:Boolean,default:false},
});

UserSchema.pre('save',async function(next){
	// var user=this;
	this.password = await bcrypt.hash(this.password,10);
	next();
});

module.exports=mongoose.model('User',UserSchema);