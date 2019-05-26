var mongoose=require('mongoose');
var Schema=mongoose.Schema;
import 'babel-polyfill';

var NotificationSchema=new Schema({
    notification:{type: String, required: true},
    date:{type: String, required: true},
    userid:{type: String, required: true}
});

module.exports=mongoose.model('Notification',NotificationSchema);