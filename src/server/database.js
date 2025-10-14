const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" }); // or your region

const dynamoClient = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoClient;