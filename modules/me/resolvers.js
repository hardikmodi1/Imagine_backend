import 'babel-polyfill';

import User from '../../models/User';
import Question from '../../models/Question';
import {createMiddleware} from '../../utils/createMiddleware';
import middleware from './middleware';

export const resolvers={

	User: {
		questions: async ({ _id }, _, __) => {
			return await Question.find({Userid: _id}).select('Question')
		}
	},

	Query: {
		me: createMiddleware(middleware,(_,__,{session}) => User.findById(session.userId))
	}
}