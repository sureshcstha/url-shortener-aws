const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const shortCode = event.pathParameters.shortenedCode;

  const params = {
    TableName: 'URLMappings',
    Key: { shortCode },
  };

  try {
    const result = await dynamoDB.get(params).promise();
    if (result.Item) {
      await dynamoDB.update({
        TableName: 'URLMappings',
        Key: { shortCode },
        UpdateExpression: 'SET clicks = if_not_exists(clicks, :start) + :inc',
        ExpressionAttributeValues: { ':inc': 1, ':start': 0 },
      }).promise();

      return {
        statusCode: 302,
        headers: {
            Location: result.Item.originalUrl, // redirect to original URL
        },
      };
    }
    return { statusCode: 404, body: JSON.stringify({ message: 'Short URL not found' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Error fetching URL' }) };
  }
};
