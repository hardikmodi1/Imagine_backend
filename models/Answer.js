var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';

var AnswerSchema=new Schema({
	Answer:{type: String, required: true},
    Userid:{type: String, required: true},
    Questionid:{type: String, required: true},
    date: {type: String, required: true}
});


module.exports=mongoose.model('Answer',AnswerSchema);