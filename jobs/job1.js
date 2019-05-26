import User from '../models/User';
import Fertilizer from '../models/Fertilizer';
import Notification from '../models/Notifications';

var schedule = require('node-schedule');
 
var j = schedule.scheduleJob('42 * * * * *', async function(){
	const users = await Fertilizer.find({});
	var i=0;
	for (i = 0 ; i < users.length ; i++){
		if(users[i].comp<new Date().getTime()-(240*60*60*24*1000)){
			console.log(users[i].Userid);
			var notification = new Notification();
			notification.notification = "It is time for you to fertilize your farm!";
			notification.date = Date();
			notification.userid=users[i].Userid;
			await notification.save();
		}
	}
});

module.exports = j;

