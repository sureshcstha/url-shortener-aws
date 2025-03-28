const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const allowedOrigins = ['https://shrunkit.netlify.app', 'https://tny.shresthatech.com'];

exports.handler = async (event) => {
  const origin = event.headers.origin; // Get the Origin header from the incoming request
  const shortCode = event.pathParameters.shortCode;

  // Check if the origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Forbidden: Origin not allowed' }),
    };
  }

  const params = {
    TableName: 'URLMappings',
    Key: { shortCode },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (result.Item) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": origin, 
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ shortCode, originalUrl: result.Item.originalUrl }),
      };
    }
    return { statusCode: 404, body: JSON.stringify({ message: 'Short URL not found' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Error fetching destination URL' }) };
  }
};
