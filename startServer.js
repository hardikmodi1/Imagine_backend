import 'babel-polyfill';
import * as fs from 'fs';
import {importSchema} from 'graphql-import';
import {mergeSchemas,makeExecutableSchema} from 'graphql-tools';
import {GraphQLServer} from 'graphql-yoga';
import mongoose from 'mongoose';
import * as path from 'path';
var Redis = require('ioredis');

import User from './models/User';

export const startServer = async () => {
	const folders=fs.readdirSync(path.join(__dirname,"./modules"));
	const schemas=[];
	folders.forEach((folder)=>{
		const {resolvers}=require(`./modules/${folder}/resolvers`);
		const typeDefs=importSchema(path.join(__dirname,`./modules/${folder}/schema.graphql`));

		schemas.push(makeExecutableSchema({resolvers,typeDefs}));
	});

	const redis=new Redis();

	const server=new GraphQLServer({
		schema:mergeSchemas({schemas}),
		context:({request})=>({
			redis,
			url: request.protocol+"://"+request.get("host")
		})
	});

	server.express.get("/confirm/:id",async (req,res)=>{
		const {id}=req.params;
		const userId=await redis.get(id);
		if(userId){
			User.findById(userId).select('confirmed').exec(function(err,user){
				if(err){
					res.send("not ok");
				}
				if(!user){
					res.send("not ok");
				}
				user.confirmed=true;
				user.save(function(err){
					if(err){
						res.send("not ok");
					}
					redis.del(id);
					res.send("ok");
				})
			})
		}
		else{
			res.send("not ok");
		}

	})

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
	const p=process.env.NODE_ENV==='test' ? 0 : 4000;
	const app = await server.start({port : process.env.NODE_ENV==='test' ? 0 : 4000 });
	console.log('Serevr running on localhost:'+p);
	return app;
}