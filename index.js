const AWS =require('aws-sdk');
const nyt = require('./nyt');

const s3 = new AWS.S3();
const BUCKET = process.env.BUCKET;

exports.handler = async (event) => {
  putTextFile(await nyt());
  
  const response = {
    statusCode: 200,
    body: JSON.stringify('data put'),
  };
  return response;
};

function putTextFile(data) {
  const now = new Date();
  const filename = [now.getFullYear(), now.getMonth()+1, now.getDate()].join('-');
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
