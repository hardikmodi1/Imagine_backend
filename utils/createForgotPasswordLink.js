import {v4} from 'uuid';
import 'babel-polyfill';

export const createForgotPasswordLink = async(url,userId,redis) => {
	const id=v4();
	await redis.set(`forgot:${id}`,userId,"ex",60*20);
	return `${url}/change-password/${id}`;
}