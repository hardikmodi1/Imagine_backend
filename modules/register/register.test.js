import {request} from 'graphql-request';
import 'babel-polyfill';
// import mongoose from 'mongoose';
var Redis = require('ioredis');
import fetch from 'node-fetch';

import {createConfirmEmailLink} from '../../utils/createConfirmEmailLink';

import {duplicateEmail,emailNotLongEnough,invalidEmail,passwordNotLongEnough} from './errorMessages';
import User from '../../models/User';
import {startServer} from '../../startServer';

let getHost=()=>'';
let userId="";
const redis=new Redis();

beforeAll(async()=>{
	const app=await startServer();
	const {port}=app.address();
	getHost=()=>`http://127.0.0.1:${port}`;
	var user = new User();
	user.email = "test@test.com";
	user.password="jklamnlcndkcn";
	await user.save();
	userId=user._id;
})

const email="hari@hardik.com";
const password="123456789";

const mutation=(e,p)=>`
	mutation{
		register(email: "${e}", password: "${p}"){
			path
			message
		}
	}
`;

describe("Check for createConfirmEmailLink",async()=>{
	it("Make sure createConfirmEmailLink function is working",async()=>{
		const url=await createConfirmEmailLink(getHost(),userId,redis);
		const response=await fetch(url);
		const text=await response.text();
		console.log(text);
		expect(text).toEqual("ok");
		User.findById(userId).select('confirmed').exec(function(err,user){
			if(err){
				return "error";
			}
			if(user){
				expect(user.confirmed).toBeTruthy();
			}
		})
		const chunks=url.split("/");
		const key=chunks[chunks.length-1];
		const value=await redis.get(key);
		expect(value).toBeNull();
	});

	it("Checking sends invalid back if bad id is sent",async()=>{
		var url=getHost();
		url=url+'/confirm/12345';
		const response=await fetch(url);
		const text=await response.text();
		console.log(text);
		expect(text).toEqual("not ok");
	});
})

describe("Register user", async () => {
	
	it("Check for duplicate emails",async () => {
		// making sure we can register a user
		const response = await request(getHost(),mutation(email,password));
		expect(response).toEqual({register:null});
		const users=await User.find({email:email});
		expect(users).toHaveLength(1);
		const user=users[0];
		expect(user.email).toEqual(email);
		expect(user.password).not.toEqual(password);
		// test for duplicate email
		const response2 = await request(getHost(),mutation(email,password));
		expect(response2.register).toHaveLength(1);
		expect(response2.register[0]).toEqual({
			path: "email",
			message: duplicateEmail
		});
	});

	it("Check for bad emails", async () => {
		// catching bad emails and passwords
		const response3 = await request(getHost(),mutation("b",password));
		expect(response3).toEqual({
			register: [
				{
					path: "email",
					message: emailNotLongEnough
				},
				{
					path: "email",
					message: invalidEmail
				}
			]
		});
	});

	it("Checking for bad passwords",async () =>{
		// catching bad passwords
		const response4 = await request(getHost(),mutation(email,"bd"));
		expect(response4).toEqual({
			register: [
				{
					path: "password",
					message: passwordNotLongEnough
				}
			]
		});
	});

	it("Checking for bad email and password",async () => {
		// checking for both bad email and password
		const response5 = await request(getHost(),mutation("bd","bd"));
		expect(response5).toEqual({
			register: [
				{
					path: "email",
					message: emailNotLongEnough
				},
				{
					path: "email",
					message: invalidEmail
				},
				{
					path: "password",
					message: passwordNotLongEnough
				}
			]
		});
	});
});