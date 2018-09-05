import 'babel-polyfill';

import User from '../../models/User';
import {createMiddleware} from '../../utils/createMiddleware';
import middleware from './middleware';

export const resolvers={
	Query: {
		me: createMiddleware(middleware,(_,__,{session}) => User.findById(session.userId))
	}
}