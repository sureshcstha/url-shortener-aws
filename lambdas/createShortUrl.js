const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { originalUrl } = JSON.parse(event.body);
  const shortCode = uuidv4().slice(0, 7); // Generate a 7-char short code

  const params = {
    TableName: 'URLMappings',
    Item: {
        shortCode,
        originalUrl,
        clicks: 0
    },
  };

  try {
    await dynamoDB.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ shortCode, shortUrl: `https://shresthatech.com/${shortCode}` }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Error creating short URL' }) };
  }
};
