import {request} from 'graphql-request';
import 'babel-polyfill';
import axios from 'axios';
// import mongoose from 'mongoose';
var Redis = require('ioredis');
import fetch from 'node-fetch';

import {createConfirmEmailLink} from '../../utils/createConfirmEmailLink';
import {createForgotPasswordLink} from '../../utils/createForgotPasswordLink';

import {
	duplicateEmail,
	emailNotLongEnough,
	invalidEmail,
	passwordNotLongEnough
} from './errorMessages';
import User from '../../models/User';
import {startServer} from '../../startServer';
import {TestClient} from '../../utils/testClient';
import {
	invalidLogin,
	emailNotVerified,
	invalidPassword,
	forgotPassword
} from '../login/errorMessages';
import {
	expiredKeyError
} from '../forgotPassword/errorMessages';
import {forgotPasswordLockAccount} from '../../utils/forgotPasswordLockAccount';

let getHost=()=>'';
let userId="";
let checkId="";
let forgotId="";
const redis=new Redis();
let newPassword="pwdChanged"

beforeAll(async()=>{
	const app=await startServer();
	const {port}=app.address();
	getHost=()=>`http://127.0.0.1:${port}`;
	var user = new User();
	user.email = "test@test.com";
	user.password="jklamnlcndkcn";
	await user.save();
	userId=user._id;
	var getCurrentUser=new User();
	getCurrentUser.email="checking@checking.com";
	getCurrentUser.password="checking";
	getCurrentUser.confirmed=true;
	getCurrentUser.save();
	checkId=getCurrentUser.id;

	var forgotPassword=new User();
	forgotPassword.email="forgot@forgot.com";
	forgotPassword.password="forgot";
	forgotPassword.confirmed=true;
	forgotPassword.save();
	forgotId=forgotPassword.id;
})

const email="hari@hardik.com";
const password="123456789";

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
		const client=new TestClient(getHost());
		const response=await client.register(email,password);
		// const response = await request(getHost(),mutation(email,password));
		expect(response.data).toEqual({register:null});
		const users=await User.find({email:email});
		expect(users).toHaveLength(1);
		const user=users[0];
		expect(user.email).toEqual(email);
		expect(user.password).not.toEqual(password);
		// test for duplicate email
		const response2=await client.register(email,password);
		// const response2 = await request(getHost(),mutation(email,password));
		expect(response2.data.register).toHaveLength(1);
		expect(response2.data.register[0]).toEqual({
			path: "email",
			message: duplicateEmail
		});
	});

	it("Check for bad emails", async () => {
		// catching bad emails and passwords
		const client=new TestClient(getHost());
		const response3=await client.register("b",password);
		// const response3 = await request(getHost(),mutation("b",password));
		expect(response3.data).toEqual({
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
		const client=new TestClient(getHost());
		const response4=await client.register(email,"bd");
		expect(response4.data).toEqual({
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
		const client=new TestClient(getHost());
		const response5=await client.register("bd","bd");
		
		expect(response5.data).toEqual({
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

describe("Checking Login functionality",()=>{
	it("email not found in database",async ()=>{
		const client=new TestClient(getHost());
		const response=await client.login("no@no1.com","whatever");
		expect(response.data).toEqual({
			login: [{
				path: "email",
				message: invalidLogin
			}]
		})
	});

	it("email not confirmed",async()=>{
		const client=new TestClient(getHost());
		const response=await client.register("no@no.com","whatever");
		const response2=await client.login("no@no.com","whatever");
		expect(response2.data).toEqual({
			login: [{
				path: "email",
				message: emailNotVerified
			}]
		});
		// User.findOne({email:"no@no.com"}).select('confirmed').exec(function(err,user){
		// 	user.confirmed=true;
		// 	user.save(function(err){
		// 		request(getHost(),loginMutation("no@no.com","whatever1")).then((response3)=>{
		// 			expect(response3).toEqual({
		// 				login: [{
		// 					path: "password",
		// 					message: invalidPassword
		// 				}]
		// 			});
		// 		});
		// 	})
		// })
		// User.findOne({email:"no@no.com"}).select('confirmed').exec(function(err,user){
		// 	user.confirmed=true;
		// 	user.save(function(err){
		// 		request(getHost(),loginMutation("no@no.com","whatever")).then((response4)=>{
		// 			expect(response4).toBeNull();
		// 		});
		// 	})
		// })
	});
});

describe("Me query",()=>{

	it("return null if no cookie",async ()=>{
		const client=new TestClient(getHost());
		const response=await client.me();
		expect(response.data.me).toBeNull();
	});

	it("get current user back",async ()=>{
		const client=new TestClient(getHost());
		await client.login("checking@checking.com","checking");

		const response2=await client.me();
		expect(response2.data.me.email).toEqual("checking@checking.com");
		expect(response2.data.me.id).toEqual(checkId);

		// checking logout
		
		await client.logout();
		const response=await client.me();
		expect(response.data.me).toBeNull();

		// checking multiple sesssions
		const sess1=new TestClient(getHost());
		const sess2=new TestClient(getHost());
		await sess1.login("checking@checking.com","checking");
		await sess2.login("checking@checking.com","checking");
		expect(await sess1.me()).toEqual(await sess2.me());
		await sess2.logout();
		expect(await sess1.me()).toEqual(await sess2.me());
	});
});

describe("forgot password",()=>{
	it("making sure it works", async ()=>{
		const client=new TestClient(getHost());
		await forgotPasswordLockAccount(forgotId,redis);
		const url=await createForgotPasswordLink("",forgotId,redis);
		const chunks=url.split("/");
		const key=chunks[chunks.length-1];

		// make sure you can't log in from locked account
		expect(await client.login("forgot@forgot.com","forgot")).toEqual({
			data:{
				login: [{
					path: "email",
					message: forgotPassword
				}]
			}
		});

		expect(await client.forgotPasswordChange("bd",key)).toEqual({
			data:{
				forgotPasswordChange: [{
					path: "newPassword",
					message: passwordNotLongEnough
				}]
			}
		});

		const response=await client.forgotPasswordChange(newPassword,key);
		expect(response.data).toEqual({
			forgotPasswordChange:null
		});

		// // make sure key expires after change password
		expect(await client.forgotPasswordChange("checkingitexpires",key)).toEqual({
			data:{
				forgotPasswordChange: [{
					path: "key",
					message: expiredKeyError
				}]
			}
		});

		const resp=await client.login("forgot@forgot.com",newPassword);
		console.log(resp.data.login);
		expect(await client.me()).toEqual({
			data:{
				me:{
					id: forgotId,
					email: "forgot@forgot.com"
				}
			}
		});
	});
});