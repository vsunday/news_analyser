const request = require("request");
const xml2js = require('xml2js');

const XML_URL = 'http://rss.nytimes.com/services/xml/rss/nyt/Business.xml';
const TIME_WINDOW = 6;

// return promise containing urls and dates
// takes only urls updated within TIME_WINDOW hours
// function get_urls_from_xml() {
module.exports = () => {
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
};
