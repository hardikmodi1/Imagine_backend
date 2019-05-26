var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';

var NutritionSchema=new Schema({
	nitrogen:{type: Number, required: true},
    phos: {type: Number, default: null},
	potassium: {type: Number, required: true},
    ph: {type: Number, required: true},
    temp: {type: Number, required: true},
    organ: {type: Number, required: true},
    yield: {type: Number, required: false},
    Userid:{type: String, required: true},
    date: {type: String, required: true},
});

module.exports=mongoose.model('Nutrition',NutritionSchema);