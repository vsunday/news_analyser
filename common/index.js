const request = require("request");

const AYLIEN_SUMMARIZE_URL = 'https://api.aylien.com/api/v1/summarize';
const APP_ID = process.env.APP_ID;
const API_KEY = process.env.API_KEY;
const NUM_SENTENCES = 3;

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
      sentences_number:NUM_SENTENCES,
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

// return array of {url: original url, summary: summarized texts, date: date}
// arg data is array of object containing url and date
async function iterate_urls(data) {
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

//compose tab delimited text
async function result_to_text(array_of_urls) {
  const result = JSON.parse(await iterate_urls(array_of_urls))['result'];
  const tab_spt = [];
  for (let i=0; i<result.length; i++) {
    tab_spt.push([result[i].url, result[i].date, result[i].summary].join('\t'));
  }
  console.log(tab_spt);
  return tab_spt.join('\n');
}

module.exports = {result_to_text: result_to_text};
