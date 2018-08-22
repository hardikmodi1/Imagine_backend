import {GraphQLServer} from 'graphql-yoga';
import {importSchema} from 'graphql-import';
import 'babel-polyfill';
import mongoose from 'mongoose';

import {resolvers} from './resolvers';

export const startServer = async () => {
	const typeDefs=importSchema('schema.graphql');
	const server=new GraphQLServer({typeDefs,resolvers});
	await mongoose.connect('mongodb://localhost:27017/boilerplate',{ useNewUrlParser: true },function(err){
		if(err){
			console.log(err);
			console.log("Error connecting database");
		}
		else{
			console.log(process.env.NODE_ENV);
			console.log("Connected successfully");
		}
	});
	const app = await server.start({port : process.env.NODE_ENV==='test' ? 0 : 4000 });
	console.log('Serevr running on localhost:4000')
	return app;
}