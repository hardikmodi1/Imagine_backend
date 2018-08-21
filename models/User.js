var mongoose=require('mongoose');

var UserSchema=new Schema({
	email:{type:String,required:true,lowercase:true,unique:true},
	password:{type:String,required:true,select:false}
});

module.exports=mongoose.model('User',UserSchema);