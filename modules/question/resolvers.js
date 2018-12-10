import * as bcrypt from 'bcryptjs';
import 'babel-polyfill';
import {withFilter} from 'graphql-yoga';
const moment = require('moment');

import Question from '../../models/Question';
import Answer from '../../models/Answer';
import User from '../../models/User';
import { PUBSUB_NEW_ANSWER } from './shared';

export const resolvers={

    question: {
        user: async ({ Userid }, _, { userLoader }) => userLoader.load(Userid)
    },

    answer: {
        answers: async ({ _id }, _, __) => {
            return await Answer.find({Questionid: _id}).sort({date: -1});
        },
        user: async ({ Userid }, _, { userLoader }) => {
            return await User.findById(Userid);
        }
    },

    singleanswer: {
        user: async ({ Userid }, _, { userLoader }) => userLoader.load(Userid)
    },

    Subscription: {
        newAnswer: {
            subscribe: 
            withFilter((_, __, {pubsub}) => pubsub.asyncIterator(PUBSUB_NEW_ANSWER), (payload, variables) => {
                return payload.newAnswer.Questionid === variables.questionid
            })
        }
    },

	Query: {
		questions:async (_, __) => {
            return await Question.find({}).sort({date: -1});
        },
        searchQuestionWithAnswer: async (_, {questionid},__)=>{
            return await Question.findById(questionid);
        }
    },
    Mutation: {
		addQuestion: async (_, {question,explanation},{session,redis,req})=>{
            var que = new Question();
            if(question==''){
                return [{
                    path: "question",
                    message: "Title should not be blank"
                }]
            }
            que.Question = question;
            que.date = Date();
            que.Userid = session.userId;
            if(explanation && explanation!==''){
                que.Explanation = explanation;
            }
            await que.save();
            return null;
        },
        addAnswer: async (_, {questionid,answer},{session, pubsub})=>{
            var ans = new Answer();
            var stripedHtml = answer.replace(/<[^>]+>/g, '');
            stripedHtml=stripedHtml.replace(/\s\s+/g, ' ');
            if(stripedHtml === '' || stripedHtml === ' '){
                return false;
            }
            ans.Answer = answer;
            ans.Userid = session.userId;
            ans.Questionid = questionid;
            ans.date = Date();
            const answer1 = await ans.save();
            pubsub.publish(PUBSUB_NEW_ANSWER, {
                newAnswer: answer1
            });
            return true;
        },
        searchQuestion: async (_, {searchText},__)=>{
            return await Question.find({$text:{$search:searchText}},{score:{$meta:"textScore"}}).sort({score:{$meta:"textScore"}});
            // return search;
        },
        // searchQuestionWithAnswer: async (_, {questionid},__)=>{
        //     return await Question.findById(questionid);
        // }
    }
}