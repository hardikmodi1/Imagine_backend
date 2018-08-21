import * as bcrypt from 'bcryptjs';
import 'babel-polyfill';
import User from './models/User';

export const resolvers={
	Query: {
		hello: (_, {name}) => `Hello ${name||'World!'}`,
	},

	Mutation: {
		register: async (_, {email,password})=>{
			const hashedPassword = await bcrypt.hash(password,10);
			var user = new User();
			user.email = email;
			user.password = hashedPassword;
			await user.save();
			return true;
		}
	}
}