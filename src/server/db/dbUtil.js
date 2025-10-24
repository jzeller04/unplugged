import {  DeleteItemCommand, DynamoDBClient,  /*GetItemCommand,*/  PutItemCommand, ScanCommand  } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-2" });


async function pushUser(user) {

    

    
    
    const exists = await userExists(user.email);
    if(exists)
    {
        console.log("Cannot register a user that is already registered!");
        return false;
        //console.log("All users in table:", data.Items);
    }

    const command = new PutItemCommand({
        TableName: "Unplugged-Users",
        Item: {
            userId: { S: user.userId },
            name: { S: user.name },
            email: { S: user.email },
            hashedPassword: { S: user.hashword }
        }
    });

    await client.send(command);

    console.log(`User [${user.userId}] added ✅`);

    return true;
        


    //console.log("All users in table:", data.Items);
}

async function userExists(userEmail) {
    const params = (
        {
            TableName: "Unplugged-Users",
            FilterExpression: "email = :email",
            ExpressionAttributeValues: {
            ":email": { S: userEmail }
        }
    });
    
    try {
        const data = await client.send(new ScanCommand(params));
        if(data.Count > 0)
        {
            console.log("User email already exists: ", /*data*/);
            return true;
        }
        return false;

    } catch (err) {
        console.error("Error checking DB for existing user..", err);
        throw err; // up to whomever uses this to catch this (will be me anyways :/)
    }

}

async function scanWithEmail(user)
    {
        const params = (
                {
                    TableName: "Unplugged-Users",
                    FilterExpression: "email = :email",
                    ExpressionAttributeValues: {
                    ":email": { S: user.email }
                }
            });
            
            try {
                const data = await client.send(new ScanCommand(params));
                if(data.Count > 0)
                {
                    return data.Items[0];
                }
                return null;
        
            } catch (err) {
                console.error("Error checking DB for existing user..", err);
                throw err; // up to whomever uses this to catch this (will be me anyways :/)
            }
    }

async function deleteUser(user) {


    try {
        const data = await scanWithEmail(user); // check if user exists
        if(data)
        {
            // console.log(data);
            const deleteParams = (
            {
                TableName: "Unplugged-Users",
                Key: {
                    userId: {S: data.userId.S}
                }
            });
            await client.send(new DeleteItemCommand(deleteParams)); // delete user from db if found
            console.log("Delete Successful!");
            return true;
        }
    } catch (error) {
        console.log(error);
        return false; // false if didnt work
    }
    
    


}


export { client, pushUser, userExists, scanWithEmail, deleteUser };