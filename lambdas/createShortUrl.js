const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Function to generate the short code
const generateShortCode = (length = 7) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const removeTrailingSlash = (url) => {
  return url.replace(/\/$/, '');
};

const allowedOrigins = ['https://shrunkit.netlify.app', 'https://tny.shresthatech.com'];

const normalizeUrl = (url) => {
  try {
    let normalized = new URL(url.trim());

    // Convert to lowercase for hostname
    normalized.hostname = normalized.hostname.toLowerCase();

    // Remove trailing dots or slashes from the hostname
    normalized.hostname = normalized.hostname.replace(/\.+$/, "").replace(/\/+$/, "");

    // Remove 'www.' if you want a consistent format
    if (normalized.hostname.startsWith("www.")) {
      normalized.hostname = normalized.hostname.substring(4);
    }

    // Remove default ports
    if ((normalized.protocol === "https:" && normalized.port === "443") ||
        (normalized.protocol === "http:" && normalized.port === "80")) {
      normalized.port = "";
    }

    // Remove trailing slash
    normalized.pathname = normalized.pathname.replace(/\/+$/, '');

    // Decode percent-encoded characters
    normalized.pathname = decodeURIComponent(normalized.pathname);

    // Sort query parameters alphabetically
    if (normalized.search) {
      let params = new URLSearchParams(normalized.search);
      normalized.search = "?" + [...params.entries()].sort().map(([k, v]) => `${k}=${v}`).join("&");
    }

    return removeTrailingSlash(normalized.toString());
  } catch (error) {
    throw new Error("Invalid URL provided");
  }
};


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

        // try inserting with a conditional expression
        const params = {
          TableName: 'URLMappings',
          Item: {
            shortCode,
            originalUrl: normalizedUrl,
            clicks: 0,
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
        body: JSON.stringify({ shortCode, shortUrl: `https://tiny.shresthatech.com/${shortCode}` }),
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
