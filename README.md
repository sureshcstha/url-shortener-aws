## Deployment Workflow
1. Deploy the DynamoDB table first:
```
aws cloudformation deploy --template-file infrastructure/dynamoDB-setup.yaml --stack-name url-shortener-db
```

2. Deploy the Serverless stack (Lambda + API Gateway) separately:
```
serverless deploy
```