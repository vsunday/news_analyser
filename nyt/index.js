const request = require("request");
const xml2js = require('xml2js');

const XML_URL = 'http://rss.nytimes.com/services/xml/rss/nyt/Business.xml';
const AYLIEN_SUMMARIZE_URL = 'https://api.aylien.com/api/v1/summarize';
const APP_ID = process.env.APP_ID;
const API_KEY = process.env.API_KEY;
const TIME_WINDOW = 6;

// return promise containing urls and dates
// takes only urls updated within TIME_WINDOW hours
function get_urls_from_xml() {
  return new Promise((resolve, reject)=>{
    //get xml file
    request(XML_URL, (err, response, body)=>{
      if (err) console.error(err);
      
      // parse xml file
      const parser = new xml2js.Parser();
      parser.parseString(body, (err, result)=>{
        if (err) console.error(err);
        // get today's date
        const date = new Date();
        const earliest = date.setHours(date.getHours() - TIME_WINDOW);
        
        const items = result['rss']['channel'][0]['item'];
        const result_array = [];
        for (let i=0; i<items.length; i++) {
          let article_date = new Date(items[i]['pubDate']);
          //only take urls updated today
          if (article_date < earliest) continue;
          result_array.push({url: items[i]['guid'][0]['_'],date: new Date(items[i]['pubDate'][0])});
        }
        
        resolve(result_array);
      });
    });
  });
}

// get summary
// return promise containing summarised text
function get_summary(target_url) {
  if (!APP_ID || !API_KEY) {
    throw 'APP_ID and API_KEY must not be null';
  }
  const option = {
    method: 'POST',
    url: AYLIEN_SUMMARIZE_URL,
    headers: {
      "X-AYLIEN-TextAPI-Application-Key": API_KEY,
      "X-AYLIEN-TextAPI-Application-ID": APP_ID
    },
    form: {
      sentences_number:3,
      url: target_url
    }
  };
  
  return new Promise((resolve, reject)=> {
    request(option, (err, response, body)=>{
      if (err) console.error(err);
      resolve(JSON.parse(body)['sentences']);
    });
  });
}

async function iterate_urls() {
  const data = await get_urls_from_xml();
  const result_array = [];
  for (let i=0; i<data.length; i++) {
   result_array.push({
     url: data[i]['url'],
     summary: await get_summary(data[i]['url']),
     date: data[i]['date']
   });
  }
  return JSON.stringify({result: result_array});
}

async function result_to_text() {
  const result = JSON.parse(await iterate_urls())['result'];
  const tab_spt = [];
  for (let i=0; i<result.length; i++) {
    tab_spt.push([result[i].url, result[i].date, result[i].summary].join('\t'));
  }
  return tab_spt.join('\n');
}

module.exports = result_to_text;
