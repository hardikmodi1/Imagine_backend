import 'babel-polyfill';
import * as yup from 'yup';

import User from '../../models/User';
import {createForgotPasswordLink} from '../../utils/createForgotPasswordLink';
import {forgotPasswordLockAccount} from '../../utils/forgotPasswordLockAccount';
import {userNotFoundError,expiredKeyError} from './errorMessages';
import {passwordNotLongEnough} from '../register/errorMessages';
import {formatYupError} from '../../utils/formatYupError';

const schema=yup.object().shape({
	newPassword: yup
			.string()
			.min(3,passwordNotLongEnough)
			.max(255)
});

export const resolvers={
	Query: {
		bye3: () => "Bye"
	},

	Mutation: {
		sendForgotPasswordEmail:async (_,{email},{redis,session})=>{
			const user=await User.findOne({email:email});
			if(!user){
				return [{
					path: "email",
					message: userNotFoundError
				}];
			}
			await forgotPasswordLockAccount(user.id,redis);
			const url=await createForgotPasswordLink("",user.id,redis);
			return true;
		},

		forgotPasswordChange:async (_,{newPassword,key},{redis})=>{
			const userId=await redis.get(`forgot:${key}`);
			if(!userId){
				return [{
					path:"key",
					message:expiredKeyError
				}];
			}

			console.log(newPassword);

			try{
				await schema.validate({newPassword},{abortEarly:false});
			}
			catch(err){
				return formatYupError(err);
			}

			let user=await User.findById(userId).select('password forgotPasswordLocked');
			console.log(user);
			user.forgotPasswordLocked=false;
			user.password=newPassword;
			await user.save();
			await redis.del(`forgot:${key}`);

			return null;

		}
	}
}