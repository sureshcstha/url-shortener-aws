const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { originalUrl } = JSON.parse(event.body);

  // First, check if the URL already exists in the database
  const checkParams = {
    TableName: 'URLMappings',
    IndexName: 'originalUrl-index',
    KeyConditionExpression: 'originalUrl = :originalUrl',
    ExpressionAttributeValues: {
      ':originalUrl': originalUrl,
    },
  };

  try {
    const checkResult = await dynamoDB.query(checkParams).promise();
    let shortCode;

    if (checkResult.Items.length > 0) {
      // URL already exists, so use the existing short code
      shortCode = checkResult.Items[0].shortCode;
    } else {
      // URL doesn't exist, generate a new short code
      shortCode = uuidv4().slice(0, 7); // Generate a 7-char short code

      // Save the new short code to DynamoDB
      const params = {
        TableName: 'URLMappings',
        Item: {
          shortCode,
          originalUrl,
          clicks: 0,
        },
      };

      await dynamoDB.put(params).promise();
    }

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ shortCode, shortUrl: `https://shresthatech.com/${shortCode}` }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Error creating short URL' }) };
  }
};
