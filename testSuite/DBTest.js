import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";

// Make sure you are using DynamoDBClient (v3)
const client = new DynamoDBClient({ region: "us-east-2" });

async function test() {
  const command = new ListTablesCommand({});
  const data = await client.send(command);  // send() exists here
  console.log("Tables:", data.TableNames);
}

test();
