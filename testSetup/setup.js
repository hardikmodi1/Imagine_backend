import {startServer} from '../startServer';
// const {startServer}=require('../startServer');
module.exports=async()=>{
	const app=await startServer();
	const {port}=app.address();
	process.env.TEST_HOST=`http://127.0.0.1:${port}`;
}
