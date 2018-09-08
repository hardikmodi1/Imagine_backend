import 'babel-polyfill';
import * as fs from 'fs';
import {importSchema} from 'graphql-import';
import {mergeSchemas,makeExecutableSchema} from 'graphql-tools';
import {GraphQLServer} from 'graphql-yoga';
import mongoose from 'mongoose';
import * as path from 'path';
var Redis = require('ioredis');
import session from 'express-session';
import connectRedis from 'connect-redis';
const RateLimit = require("express-rate-limit");
var RateLimitRedis = require('rate-limit-redis');
import passport from 'passport';
import {Strategy} from 'passport-twitter';

import User from './models/User';

const RedisStore=connectRedis(session);

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
			url: request.protocol+"://"+request.get("host"),
			session: request.session,
			req: request
		})
	});

	server.express.use(
		new RateLimit({
			store:new RateLimitRedis({
				client: redis
			}),
			windowMs:15*60*1000,
			max:100,
			delayMs:0
		})
	);

	server.express.use(
		session({
			store: new RedisStore({
				client: redis,
				prefix: "sess:"
			}),
			name: "qid",
			secret: "jayswaminarayan",
			resave: false,
			saveUninitialized: false,
			cookie:{
				httpOnly: true,
				secure: process.env.NODE_ENV==="production",
				maxAge: 1000*60*60*24*7
			}
		})
	);

	const cors={
		credentials: true,
		origin: process.env.NODE_ENV==="test" ? "*" : "http://localhost:3000"
	}

	server.express.get("/confirm/:id",async (req,res)=>{
		const {id}=req.params;
		const userId=await redis.get(id);
		if(userId){
			const user=await User.findById(userId);
				if(!user){
					res.send("not ok");
				}
				user.confirmed=true;
				await user.save();
				await redis.del(id);
				res.send("ok");
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

	passport.use(new Strategy({
		consumerKey:'MTlVEEN3YDO1hfVPkk0GWnR61',
		consumerSecret:'ll5U1fTz3PTVL7f8CWgRnvLNIHMu8tUpJOBFGOI3eVvptwk8uA',
		callbackURL:"http://localhost:4000/auth/twitter/callback",
		includeEmail: true
	},
	async (token,tokenSecret,profile,cb)=>{
		const {id,emails}=profile;
		let email;
		if(emails){
			email=emails[0].value;
		}
		let user=await User.findOne({twitterId:id});
		if(!user){
			if(email){
				user=await User.findOne({email:email});
			}
			if(user){
				user.twitterId=id;
				await user.save();
			}
			if(!user){
				user=new User();
				user.twitterId=id;
				if(email){
					user.email=email;
				}
				await user.save();
			}
		}
		return cb(null,{id:user.id});
	}));

	server.express.use(passport.initialize());

	server.express.get('/auth/twitter',passport.authenticate('twitter'));

	server.express.get('/auth/twitter/callback',passport.authenticate('twitter',{session:false}),
		function(req,res){
			req.session.userId=req.user.id;
			res.redirect("/");
		}
	);

	const p=process.env.NODE_ENV==='test' ? 0 : 4000;
	const app = await server.start({cors,port : process.env.NODE_ENV==='test' ? 0 : 4000 });
	console.log('Serevr running on localhost:'+p);
	return app;
}