import * as bcrypt from 'bcryptjs';
import 'babel-polyfill';
import * as yup from 'yup';

import User from '../../models/User';
import {duplicateEmail,emailNotLongEnough,invalidEmail,passwordNotLongEnough} from './errorMessages';
import {formatYupError} from '../../utils/formatYupError';
import {createConfirmEmailLink} from '../../utils/createConfirmEmailLink';
import {sendEmail} from '../../utils/sendEmail';

const schema=yup.object().shape({
	email : yup
			.string()
			.min(3,emailNotLongEnough)
			.max(255)
			.email(invalidEmail),
	password: yup
			.string()
			.min(3,passwordNotLongEnough)
			.max(255)
});

export const resolvers={
	Query: {
		bye: () => "Bye"
	},

	Mutation: {
		register: async (_, args,{redis,url})=>{

			try{
				await schema.validate(args,{abortEarly:false});
			}
			catch(err){
				return formatYupError(err);
			}

			const {email,password} = args;
			const UserAlreadyExists=await User.findOne({email:email});
			if(UserAlreadyExists){
				return [
					{
						path: "email",
						message: duplicateEmail
					}
				];
			}

			const hashedPassword = await bcrypt.hash(password,10);
			var user = new User();
			user.email = email;
			user.password = hashedPassword;
			await user.save();
			const link = await createConfirmEmailLink(url,user._id,redis);
			if(process.env.NODE_ENV!=='test'){
				await sendEmail(email,link);
			}
			return null;
		}
	}
}