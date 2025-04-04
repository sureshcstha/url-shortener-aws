const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { getUserFromEvent } = require('../utils/auth');

exports.handler = async (event) => {
  try {
    if (!event.body) {
        return { statusCode: 400, body: JSON.stringify({ message: "Request body missing" }) };
    }

    const shortCode = event.pathParameters.shortCode; 
    const { newOriginalUrl } = JSON.parse(event.body);

    if (!shortCode || !newOriginalUrl) {
        return { statusCode: 400, body: JSON.stringify({ message: "Missing parameters" }) };
    }

    const user = getUserFromEvent(event);
    if (!user) return { statusCode: 401, body: JSON.stringify({ message: "Unauthorized" }) };

    // Check if the user owns this shortCode
    const getParams = {
      TableName: 'URLMappings',
      Key: { shortCode },
    };

    const getResult = await dynamoDB.get(getParams).promise();
    if (!getResult.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: "Short code not found" }) };
    }

    if (getResult.Item.createdBy !== user.sub) {
      return { statusCode: 403, body: JSON.stringify({ message: "You do not own this URL" }) };
    }

    // Update the URL
    const updateParams = {
      TableName: 'URLMappings',
      Key: { shortCode },
      UpdateExpression: "set originalUrl = :newUrl",
      ExpressionAttributeValues: { ":newUrl": newOriginalUrl },
      ReturnValues: "UPDATED_NEW",
    };

    await dynamoDB.update(updateParams).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "URL updated successfully", shortCode, newOriginalUrl }),
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: "Error updating URL", error: error.message }) };
  }
};
