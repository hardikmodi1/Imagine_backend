var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';
import * as bcrypt from 'bcryptjs';

var UserSchema=new Schema({
	email:{type:String,lowercase:true,default:null},
	password:{type:String,default:null},
	confirmed:{type:Boolean,default:false},
	forgotPasswordLocked:{type:Boolean,default:false},
	twitterId:{type:String,default:null}
});

UserSchema.pre('save',async function(next){
	// var user=this;
	if(this.password){
		if(!this.isModified('password')){
			return next();
		}
		this.password = await bcrypt.hash(this.password,10);
		next();
	}
});

module.exports=mongoose.model('User',UserSchema);