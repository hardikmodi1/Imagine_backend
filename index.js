import {GraphQLServer} from 'graphql-yoga';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/boilerplate',{ useNewUrlParser: true },function(err){
	if(err){
		console.log(err);
		console.log("Error connecting database");
	}
	else{
		console.log("Connected successfully");
	}
});

const resolvers={
	Query: {
		hello: (_, {name}) => `Bye ${name||'World!'}`,
	},
}

const server=new GraphQLServer({typeDefs,resolvers});
server.start(()=>console.log('Serevr running on localhost:4000'))