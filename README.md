## Deployment Workflow
1. Deploy the DynamoDB table first:
```
aws cloudformation deploy --template-file infrastructure/dynamoDB-setup.yaml --stack-name url-shortener-db
```

2. Deploy the Serverless stack (Lambda + API Gateway) separately:
```
serverless deploy
```

### How to delete the failed stack before re-deploying?
*Use this command with caution, as it will permanently delete the resources associated with the stack.
```
aws cloudformation delete-stack --stack-name url-shortener-db

```
