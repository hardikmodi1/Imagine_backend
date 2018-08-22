import {request} from 'graphql-request';
import 'babel-polyfill';
// import mongoose from 'mongoose';

import {host} from './constants';
import User from '../models/User';
import {startServer} from '../startServer';

let getHost=()=>'';

beforeAll(async()=>{
	const app=await startServer();
	const {port}=app.address();
	getHost=()=>`http://127.0.0.1:${port}`;
})

const email="hari@hardik.com";
const password="1234567890";

const mutation=`
	mutation{
		register(email: "${email}", password: "${password}")
	}
`;

test("Register user", async () => {
	const response = await request(getHost(),mutation);
	expect(response).toEqual({register:true});
	// await mongoose.connect('mongodb://localhost:27017/boilerplate',{ useNewUrlParser: true });
	const users=await User.find({email:email});
	expect(users).toHaveLength(1);
	const user=users[0];
	expect(user.email).toEqual(email);
	expect(user.password).not.toEqual(password);
	afterAll(() => setTimeout(() => process.exit(), 1000));
});