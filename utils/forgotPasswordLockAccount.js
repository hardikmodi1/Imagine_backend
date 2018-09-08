import 'babel-polyfill';

import {removeUserSessions} from './removeUserSessions';
import User from '../models/User';

export const forgotPasswordLockAccount=async (userId,redis)=>{

	// can't login
	console.log("yt");
	console.log(userId);
	const user=await User.findById(userId).select('forgotPasswordLocked');
	user.forgotPasswordLocked=true;
	await user.save();

	// remove all sessions of that user
	await removeUserSessions(userId,redis); 
}