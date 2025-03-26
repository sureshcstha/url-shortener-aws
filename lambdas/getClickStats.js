const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const shortCode = event.pathParameters.shortCode;

  const params = { TableName: 'URLMappings', Key: { shortCode } };

  try {
    const result = await dynamoDB.get(params).promise();
    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify({ shortCode, clicks: result.Item.clicks || 0 }),
      };
    }
    return { statusCode: 404, body: JSON.stringify({ message: 'Short URL not found' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Error fetching click stats' }) };
  }
};
