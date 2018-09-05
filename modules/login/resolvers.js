import * as bcrypt from 'bcryptjs';
import 'babel-polyfill';

import User from '../../models/User';
import {createConfirmEmailLink} from '../../utils/createConfirmEmailLink';
import {sendEmail} from '../../utils/sendEmail';
import {invalidLogin,errorFinding,invalidPassword,emailNotVerified} from './errorMessages';


export const resolvers={
	Query: {
		bye2: () => "Bye"
	},

	Mutation: {
		login: async (_, {email,password},{session})=>{
			const user=await User.findOne({email:email}).select('email password confirmed')
				if(!user){
					return  [{
						path: "email",
						message: invalidLogin
					}];
				}
				if(!user.confirmed){
					return [{
						path: "email",
						message: emailNotVerified
					}]
				}
				var validPassword=await bcrypt.compare(password,user.password);
				console.log(validPassword);
				if(!validPassword){
					return [{
						path: "password",
						message: invalidPassword
					}]
				}

				session.userId=user.id;
				await session.save(function(err){
					console.log(err);
				});
				return null;
		}
	}
}