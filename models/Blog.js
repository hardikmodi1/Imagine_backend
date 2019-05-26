var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';

var BlogSchema=new Schema({
	Title:{type: String, required: true, default: 0},
	Blog: {type: String, required: true, default: 0},
	Userid:{type: String, required: true, default: 0},
    date: {type: String, required: true, default: 0},
    prefferedImage: {type: String, default: 0}
});

BlogSchema.index({"Title":"text", "Blog": "text"},{"weights":{Title: 20, Blog: 10}});

module.exports=mongoose.model('Blog',BlogSchema);