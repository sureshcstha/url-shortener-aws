const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Function to generate the short code
const generateShortCode = (length = 7) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const allowedOrigins = ['https://shrunkit.netlify.app', 'https://tny.shresthatech.com'];

exports.handler = async (event) => {
  const { originalUrl } = JSON.parse(event.body);
  const origin = event.headers.origin; // Get the Origin header from the incoming request

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
      shortCode = generateShortCode();

      // Check if the short code already exists in DynamoDB
      let isUnique = false;

      while (!isUnique) {
        // Check if the short code already exists in the database
        const shortCodeCheckParams = {
          TableName: 'URLMappings',
          KeyConditionExpression: 'shortCode = :shortCode',
          ExpressionAttributeValues: {
            ':shortCode': shortCode,
          },
        };

        const shortCodeCheckResult = await dynamoDB.query(shortCodeCheckParams).promise();

        if (shortCodeCheckResult.Items.length === 0) {
          // Short code is unique, break the loop
          isUnique = true;
        } else {
          // Short code already exists, generate a new one
          shortCode = generateShortCode();
        }
      }

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

    if (allowedOrigins.includes(origin)) {
      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ shortCode, shortUrl: `https://tiny.shresthatech.com/${shortCode}` }),
      };
    } else {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Forbidden: Origin not allowed' }),
      };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Error creating short URL' }) };
  }
};
