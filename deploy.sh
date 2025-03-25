#!/bin/bash

aws lambda update-function-code --function-name createShortUrl --zip-file fileb://createShortUrl.zip
aws lambda update-function-code --function-name redirectUrl --zip-file fileb://redirectUrl.zip
aws lambda update-function-code --function-name getClickStats --zip-file fileb://getClickStats.zip

echo "Deployment complete!"
