# AWS Serverless URL Shortener
A simple, scalable, and cost-effective URL shortener built with the Serverless Framework on AWS. This service uses API Gateway, Lambda, and DynamoDB to create and redirect short URLs.

## Features
* __Create Short URLs__: Generate a unique, short identifier for any long URL.
* __Redirect Short URLs__: Automatically redirect users from the short URL to the original long URL.
* __Serverless__: No servers to manage. The application scales automatically with demand.
* __Cost-Effective__: Leverages AWS Lambda and DynamoDB, so you only pay for what you use.
* __Easy to Deploy__: Deploy the entire stack with a single Serverless Framework command.

## Technology Stack
* __Framework__: Serverless Framework
* __Cloud Provider__: AWS (Amazon Web Services)
* __Compute__: AWS Lambda for running the application logic.
* __Database__: AWS DynamoDB for storing the URL mappings.
* __API__: AWS API Gateway to create and manage the REST API endpoints.
* __Language__: Node.js

## Getting Started

### Prerequisites
* Node.js (v22)
* npm
* Serverless Framework CLI
* An AWS account with configured credentials.

### Installation & Deployment
**1. Clone the repository:**
```
git clone https://github.com/sureshcstha/url-shortener-aws.git
cd url-shortener-aws
```
**2. Install dependencies:**
```
npm install
```
**3. Deploy the DynamoDB table:**
```
aws cloudformation deploy --template-file infrastructure/dynamoDB-setup.yaml --stack-name url-shortener-db
```
**4. Deploy to AWS:**

Run the following command to deploy the Serverless stack (API Gateway, Lambda) to your AWS account.
```
serverless deploy
```
After a successful deployment, the Serverless Framework will output the API endpoints in your terminal. This is the base URL for your new shortener service.



## API Usage

**1. Shorten a URL** <br>
**Method**: `POST` <br>
**Endpoint**: ` /shorturl` <br>
**Request Body**: 
```
{
  "originalUrl": "https://llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch.co.uk"
}
```

**Success Response (200)**:
```
{
  "shortCode": "9jVdQK7",
  "shortUrl": "https://tiny.shresthatech.com/9jVdQK7"
}
```

**2. Redirect to orignal URL** <br>
**Method**: `GET` <br>
**Endpoint**: ` /{shortUrl}` 
* __Example__:

Visit ```https://tiny.shresthatech.com/9jVdQK7``` in your browser. Your browser will automatically follow the redirect.

**3. Look up the original URL** <br>
**Method**: `GET` <br>
**Endpoint**: ` /lookup/{shortUrl}` <br>
**Success Response (200)**:
```
{
  "shortCode": "9jVdQK7",
  "originalUrl": "https://llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch.co.uk"
}
```

**4. Get click statistics** <br>
**Method**: `GET` <br>
**Endpoint**: ` /clickstats/{shortUrl}` <br>
**Success Response (200)**:
```
{
  "shortCode": "9jVdQK7",
  "clicks": 42,
  "lastAccessed": "2025-04-02T20:36:46.792Z"
}
```

## Configuration
The core configuration is managed in the ```serverless.yml``` file.
* ```service```: ```url-shortener``` - The name of the service.
* ```provider```: Defines the AWS region, runtime (Node.js version), and environment variables.
* ```functions```: Defines the Lambda functions, their handlers, and the API Gateway events that trigger them.
* ```resources```: Defines the AWS resources created by this stack.