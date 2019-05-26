var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';

var FertilizerSchema=new Schema({
	Userid:{type: String, required: true},
	date:{type: String, required: true},
	comp:{type: Number, required: true}
});

module.exports=mongoose.model('Fertilizer',FertilizerSchema);