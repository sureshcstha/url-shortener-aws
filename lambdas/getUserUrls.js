const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { getUserFromEvent } = require('../utils/auth');

exports.handler = async (event) => {
  try {
    const user = getUserFromEvent(event);
    if (!user) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

    const params = {
      TableName: 'URLMappings',
      IndexName: 'createdBy-index', 
      KeyConditionExpression: 'createdBy = :userId',
      ExpressionAttributeValues: { ':userId': user.sub },
    };

    const result = await dynamoDB.query(params).promise();
    return { statusCode: 200, body: JSON.stringify(result.Items) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error retrieving URLs", error: error.message }) };
  }
};
