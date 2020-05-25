# Introduction
This bot will make Haircut Appointment Schedule. It will then store customers Appointment details in AWS DynamoDb and send a Text message notification to customers. Following are the key features of this bot:

- Send notification for cancellation/updation/creation.
- Remember the customers when they come again to talk even after they cancelled their appointment.
- Easy quick reply options to select appointment type.
- Verifies whether the booked slot time is available or not.

## Video Demonstration/link
[![image](https://user-images.githubusercontent.com/47825998/82384501-7259cf80-9a49-11ea-849b-e105144821cb.png)](https://vimeo.com/420439994)

## Setting up AWS Lex Console

Sign-in to [AWS Console](https://console.aws.amazon.com/console/home).Inside bots section click on the actions(drop-down menu) and select the  Import. Browse the zip file from this repository.

## Setting up DynamoDB
Set up your Dynamo DB by following this [guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.html). Create tables and items according to the keys written in dynamodb.js.

## Setting up SNS Text Messaging

Follow the official documentation of [AWS SNS](https://docs.aws.amazon.com/sns/latest/dg/sns-getting-started.html). Configure your text messaging prefrences.

## Setting up Lambda Function
Go to AWS Management Console and select the **Lambda Function** follow this [guide](https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html) to create a new function. Name this new function **appointment-scheduler-bot**.

## Installation

```bash
npm install
```
Install AWS CLI if you don't have already
```bash
aws configure
```
Provide secretAccessKey, accessId and region to configure your aws cli

## Deployment
Upload a zip file of your lambda function using the following command:
```
npm run deploylinux // for linux

npm run deploywindows // for windows
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## License
[MIT](https://choosealicense.com/licenses/mit/)
