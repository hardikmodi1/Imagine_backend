import 'babel-polyfill';
import * as yup from 'yup';

import User from '../../models/User';
import Nutrition from '../../models/Nutrition';
import Fertilizer from '../../models/Fertilizer';
import Notification from '../../models/Notifications';
import { Http2ServerRequest } from 'http2';

export const resolvers={

	Query: {
		SHCInfo: async (_, {userid}, __)=>{
            const data = await Nutrition.find({Userid: userid});
            console.log("gr",data.length);
            if(data.length!=0){
                return data;
            }
            else{
                console.log("gel");
                return [{
                    nitrogen: 0,
                    phos: 0,
                    potassium: 0,
                    ph: 0,
                    temp: 0,
                    organ: 0,
                    yield: 0
                }]
            }
        },
        fertInfo: async (_, {userid}, __)=>{
            return await Fertilizer.find({Userid: userid}).select('date');
        },
        notifications: async (_, {userid}, __)=>{
            return await Notification.find({userid: userid}).sort({date: -1});
        }
	},

	Mutation: {
		addSHC:async (_,{n, p, k, ph, temp, organ, yield1},{redis,session})=>{
            if(!session.userId){
                return [{
                    path: "user",
                    message: "Please login to update the values"
                }]
            }
            console.log(yield1)
			const user=await Nutrition.findOne({Userid: session.userId});
			if(!user){
                const nut = new Nutrition();
                nut.nitrogen=n;
                nut.phos=p;
                nut.potassium=k;
                nut.ph=ph;
                nut.temp=temp;
                nut.organ=organ;
                nut.Userid=session.userId;
                nut.date=Date();
                nut.yield=yield1;
                await nut.save();
                return null;
			}
			user.nitrogen=n;
            user.phos=p;
            user.potassium=k;
            user.ph=ph;
            user.temp=temp;
            user.organ=organ;
            user.Userid=session.userId;
            user.date=Date();
            user.yield=yield1;
            await user.save()
			return null;
        },
        addFert:async (_, __, {redis,session})=>{
            if(!session.userId){
                return [{
                    path: "user",
                    message: "Please login to update the values"
                }]
            }
            
			const user=await Fertilizer.findOne({Userid: session.userId});
			if(!user){
                const fert = new Fertilizer();
                fert.Userid=session.userId;
                fert.date=Date();
                fert.comp=new Date().getTime();
                await fert.save();
                return null;
			}
            user.Userid=session.userId;
            user.date=Date();
            user.comp=new Date().getTime();
            await user.save()
			return null;
        }
	}
}