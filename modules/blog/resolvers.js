import 'babel-polyfill';

import User from '../../models/User';
import Blog from '../../models/Blog';

export const resolvers={
    blog: {
        user: async ({ Userid }, _, { userLoader }) => userLoader.load(Userid)
    },

    searchblog: {
        user: async ({ Userid }, _, { userLoader }) => userLoader.load(Userid)
    },

	Query: {
		blogs:async (_, __) => {
            return await Blog.find({}).sort({date: -1});
        },
        singleBlog: async (_, {blogid},__)=>{
            return await Blog.findById(blogid);
        },
        blogByUser: async (_, {userid},__)=>{
            return await Blog.find({Userid: userid}).sort({date: -1});
        },
        searchBlog: async (_, {searchText},__)=>{
            return await Blog.find({$text:{$search:searchText}},{score:{$meta:"textScore"}}).sort({score:{$meta:"textScore"}});
            // return search;
        },
    },

    Mutation: {
		addBlog: async (_, {title,blog},{session,redis,req})=>{
            if(!session.userId){
                return [{
                    path: "session",
                    message: "Your session may be expired. Retry after login!"
                }]
            }
            if(title === ''){
                return [{
                    path: "title",
                    message: "Title should not be blank."
                }]
            }
            var blogDB = new Blog();
    
            blogDB.Title = title;
            blogDB.Blog = blog;
            blogDB.date = Date();
            blogDB.Userid = session.userId;
            var pattern = /<img className='blogImg' src\s*=\s*\\*\"(.+?)\\*"\s*>/g;
            var result = pattern.exec(blog);
            if(result){
                blogDB.prefferedImage = result[0];
            }
            await blogDB.save();
            return null;
        },
        searchBlog: async (_, {searchText},__)=>{
            return await Blog.find({$text:{$search:searchText}},{score:{$meta:"textScore"}}).sort({score:{$meta:"textScore"}});
            // return search;
        },
    }
}