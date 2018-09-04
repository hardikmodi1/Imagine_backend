import {v4} from 'uuid';
import 'babel-polyfill';

export const createConfirmEmailLink = async(url,userId,redis) => {
	const id=v4();
	await redis.set(id,userId,"ex",60*60*24);
	return `${url}/confirm/${id}`;
}