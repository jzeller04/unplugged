import {  DeleteItemCommand, DynamoDBClient,  PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
//add UpdateItemCommand to import once used in code

const client = new DynamoDBClient({ region: "us-east-2" });

async function pushUser(user) {
    const today = new Date().toISOString().split('T')[0];
    
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
            streakCount: { N: "0" },
            hashedPassword: { S: user.hashword },
            lastLogin: { S: today }
        }
    });

    await client.send(command);

    console.log(`User [${user.userId}] added`);

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

async function scanWithEmail(user) {
    console.log(user.email);
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
        console.log(data);
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
            //console.log("Delete Successful!");
            return true;
        }
    } catch (error) {
        console.log(error);
        return false; // false if didnt work
    }
}

async function updateUser(user, newDate, newStreak) { // find where to put this...when session in app is started?
    const userToUpdate = await scanWithEmail(user);
    //console.log(newDate);
    if(!userToUpdate)
    {
        console.log("Error finding user with email");
        return false;
    }
    //console.log("Found user with email: ", userToUpdate.email.S);

    //temp commented out while const params is not used in this scope
    //const params = {
        //TableName: "Unplugged-Users",
        //Key: {
            //userId: { S: userToUpdate.userId.S }
        //},
            //UpdateExpression: "SET lastLoginDate = :date, streakCount = :count",
            //ExpressionAttributeValues: {
            //":date": { S: newDate },
            //":count": { N: newStreak?.toString() }
        //},
        //ReturnValues: "ALL_NEW"
    //};

    try {
        // temp commented out following line due to linting error
        // const result = await client.send(new UpdateItemCommand(params));
        
        console.log("User updated successfully. New values:");
        // console.log(result.Attributes);

        return true;
    } catch (err) {
        console.error("Error updating user:", err);
        return false;
    } 
}

function isNextDay(prev, curr) {
    const prevDate = new Date(prev);
    const currDate = new Date(curr);
    const diff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
    return diff === 1;
}

export { client, pushUser, userExists, scanWithEmail, deleteUser, isNextDay, updateUser };