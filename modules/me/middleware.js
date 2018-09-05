import 'babel-polyfill';

export default async (resolver, parent, args, context, info) => {
	// console.log('args given:',args);
	// if user is not logged in
	// if(!context.session || !context.session.userId){
	// 	return null;
	// }
	// check whatever you want to check here like user is admin or not
	console.log(context.session);	
	return resolver(parent, args, context, info);
	// console.log('result',result);
	// return result;
}