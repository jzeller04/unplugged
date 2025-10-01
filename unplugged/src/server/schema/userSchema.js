import { DynamoDBClient, PutItemCommand, ScanCommand  } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-2" });

// make class with push/update function for DB. will make coding easier

class DBUser {
    constructor(userInfo) {
        
        this.userId = userInfo.userId;
        this.email = userInfo.email;
        this.password = userInfo.password;

    }
    hashPassword()
    {
        
    }
    pushToDB()
    {

    }
}

// also make dynamodb schema here
async function addUser(user) {
    const command = new PutItemCommand({
        TableName: "Unplugged-Users",
        Item: {
            userId: { S: user.userId },
            email: { S: user.email },
            hashedPassword: { S: user.hashword }
        }
    })

    await client.send(command);
}

async function test() {
    const command = new PutItemCommand({
        TableName: "Unplugged-Users",
        Item: {
            userId: { S: "TestID12345" },
            email: { S: "dev@unplugged.com" },
            hashedPassword: { S: "password" }
        }
    })

    await client.send(command);
    console.log("Test user added ✅");

    const scanCommand = new ScanCommand({ TableName: "Unplugged-Users" });
    const data = await client.send(scanCommand);

    console.log("All users in table:", data.Items);
}


test();
