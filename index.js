import {GraphQLServer} from 'graphql-yoga';
import {importSchema} from 'graphql-import';
import mongoose from 'mongoose';

import {resolvers} from './resolvers';

const typeDefs=importSchema('schema.graphql');
const server=new GraphQLServer({typeDefs,resolvers});
mongoose.connect('mongodb://localhost:27017/boilerplate',{ useNewUrlParser: true },function(err){
	if(err){
		console.log(err);
		console.log("Error connecting database");
	}
	else{
		server.start(()=>console.log('Serevr running on localhost:4000'))
		console.log("Connected successfully");
	}
});



