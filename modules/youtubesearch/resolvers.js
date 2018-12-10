const request=require('request');
const cheerio=require('cheerio');

function doRequest(url) {
    return new Promise(function (resolve, reject) {
      request(url, function (error, res, body) {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  }

export const resolvers={
    Query: {
		bye10: () => "Bye"
	},
	Mutation: {
		youtubesearch:async (_, {query}) => {
            const html=await doRequest('https://www.youtube.com/results?search_query='+query);
            const $ = cheerio.load(html);
            var count = 0;
            var thumbnail=[];
            var links=[];
            var linkText=[];
            $('div').each((i,el)=>{
                var className = $(el).attr('class');
                if(typeof className == "string"){
                    if(className.includes('yt-lockup-dismissable')){
                        if(count<5){
                            const output = $(el).find('img');
                            thumbnail.push(output['0'].attribs.src);
                            const link = $(el).find('a');
                            links.push("https://youtube.com"+link['0'].attribs.href);
                            const text = $(el).find('a')['0'];
                            linkText.push(link['1'].attribs.title);
                            console.log(output['0'].attribs.src);
                            console.log("https://youtube.com"+link['0'].attribs.href);
                            console.log(link['1'].attribs.title);
                            console.log('-----------------------');
                            count = count + 1;
                        }
                    }
                    else{
                        
                    }
                }
            });
            return [
                {
                    link: links,
                    image: thumbnail,
                    text: linkText
                }
            ];
        },

        news:async (_, __) => {
            const html = await doRequest('https://economictimes.indiatimes.com/news/economy/agriculture');
                    const $ = cheerio.load(html);
                    var count=0
                    var thumbnail=[];
                    var link=[];
                    var heading=[];
                    var para=[];
                    $('div').each((i,el)=>{
                        var className=$(el).attr('class');
                        if(typeof className == "string"){
                            if(className.includes('eachStory')){
                                para.push($(el).children('p').text());
                                if($(el).children('h3').children('a').children('meta').attribs){
                                    heading.push($(el).children('h3').children('a').children('meta').attribs.content)
                                }
                                else{
                                    heading.push($(el).children('h3').children('a').text());
                                }
                                count+=1;
                                link.push("https://economictimes.indiatimes.com"+$(el).children('h3').children('a')['0'].attribs.href);
                                if($(el).children('a').children('span').children('img')['0']){
                                    thumbnail.push($(el).children('a').children('span').children('img')['0'].attribs['data-original']);
                                }
                                else{
                                    thumbnail.push("null");
                                }
                            }
                        }
                    });
                    return [
                        {
                            thumbnail: thumbnail,
                            link: link,
                            heading: heading,
                            para: para
                        }
                    ];
        },
	}
}