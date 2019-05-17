const AWS =require('aws-sdk');
const common = require('./common');
const nyt = require('./nyt');

const s3 = new AWS.S3();
const BUCKET = process.env.BUCKET;

exports.handler = async (event) => {
  putTextFile(await common.result_to_text(await nyt()));
  
  const response = {
    statusCode: 200,
    body: JSON.stringify('data put'),
  };
  return response;
};

function putTextFile(data) {
  const now = new Date();
  const filename = [now.getFullYear(), (now.getMonth()+1).toString().padStart(2, '0'), now.getDate().toString().padStart(2, '0')].join('');
  if (!BUCKET) throw 'BUCKET must not be null';
  const params = {
    Body: data,
    Bucket: BUCKET,
    Key: filename + '.txt'
  };
  console.log(params);
  s3.putObject(params, (err, data)=>{
    if (err) console.error(err);
      console.log(data);
  });
}

if (process.env.NODE_ENV=='TEST') {
  (async () => {putTextFile(await common.result_to_text(await nyt()))})();
}