const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { generateShortCode, normalizeUrl, getCurrentDate } = require('../utils/urlHelpers');
const { getUserFromEvent } = require('../utils/auth');

const allowedOrigins = ['https://shrunkit.netlify.app', 'https://tny.shresthatech.com'];
const baseUrl = process.env.BASE_URL; 

exports.handler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: "Request body missing" }) };
    }

    const { originalUrl } = JSON.parse(event.body);

    if (!originalUrl) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ message: "Missing URL parameter" }) 
      };
    }

    const normalizedUrl = normalizeUrl(originalUrl); // This will throw if the URL is invalid
    const user = getUserFromEvent(event);  // Extract user from token (if exists)
    const origin = event.headers?.origin || ""; // Get the Origin header from the incoming request

    // First, check if the URL already exists in the database
    const checkParams = {
      TableName: 'URLMappings',
      IndexName: 'originalUrl-index',
      KeyConditionExpression: 'originalUrl = :originalUrl',
      ExpressionAttributeValues: {
        ':originalUrl': normalizedUrl,
      },
    };

    const checkResult = await dynamoDB.query(checkParams).promise();
    let shortCode;

    if (checkResult.Items.length > 0) {
      // URL already exists, so use the existing short code
      shortCode = checkResult.Items[0].shortCode;
    } else {
      // URL doesn't exist, generate a new short code
      let isUnique = false;

      while (!isUnique) {
        // generate a new short code
        shortCode = generateShortCode();
        const currentDate = getCurrentDate();

        // try inserting with a conditional expression
        const params = {
          TableName: 'URLMappings',
          Item: {
            shortCode,
            originalUrl: normalizedUrl,
            createdBy: user ? user.sub : "anonymous", 
            clicks: 0,
            lastAccessed: currentDate,
          },
          ConditionExpression: "attribute_not_exists(shortCode)", // Ensure the shortCode does not exist
        };

        try {
          await dynamoDB.put(params).promise();
          isUnique = true; // Success, short code is unique
        } catch (error) {
          if (error.code !== 'ConditionalCheckFailedException') {
            throw error; // If it's not a duplicate conflict, rethrow
          }
        }
      }
    }

    if (allowedOrigins.includes(origin)) {
      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ shortCode, shortUrl: `${baseUrl}/${shortCode}` }),
      };
    } else {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Forbidden: Origin not allowed' }),
      };
    }
  } catch (error) {
    // console.error("Lambda Error:", error); // Log all unexpected errors in production

    if (error.message === "Invalid URL provided") {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid URL provided" }) };
    }
    return { statusCode: 500, body: JSON.stringify({ message: 'Error creating short URL', error: error.message }) };
  }
};
