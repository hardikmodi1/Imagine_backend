var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';

var QuestionSchema=new Schema({
	Question:{type: String, required: true},
	Explanation: {type: String, default: null},
	Userid:{type: String, required: true},
	date: {type: String, required: true}
});

QuestionSchema.index({"Question":"text"},{"weights":{Question: 10}});

module.exports=mongoose.model('Question',QuestionSchema);