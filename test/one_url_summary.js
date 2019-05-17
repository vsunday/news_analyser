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

const url = process.argv[2];
if (!url) {
  throw 'Enter url as argument';
} else if (url.indexOf('http') < 0) {
  throw 'Enter proper url as argument';
} else {
  get_summary(url);
}