import { DynamoDBClient, PutItemCommand, ScanCommand  } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-2" });

async function pushUser(user) {
    const command = new PutItemCommand({
        TableName: "Unplugged-Users",
        Item: {
            userId: { S: user.userId },
            name: { S: user.name },
            email: { S: user.email },
            hashedPassword: { S: user.hashword }
        }
    })

    await client.send(command);
    console.log(`User [${user.userId}] added ✅`);

    
    const scanCommand = new ScanCommand({ TableName: "Unplugged-Users" });
    const data = await client.send(scanCommand);

    console.log("All users in table:", data.Items);
}


export { client, pushUser };