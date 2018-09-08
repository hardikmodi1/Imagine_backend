import 'babel-polyfill';

import User from '../../models/User';

export const resolvers={
	Query: {
		dummy: () => "Bye"
	},

	Mutation: {
		logout: async (_,__,{session,redis}) => {
			const {userId}=session;
			if(userId){
				const sessionIds=await redis.lrange(`userSids:${userId}`,0,-1);
				const promises=[];
				for(let i=0;i<sessionIds.length;i+=1){
					promises.push(redis.del(`sess:${sessionIds[i]}`));
				}
				await Promise.all(promises);
				return true;
			}
			return false;
		}
	}
}