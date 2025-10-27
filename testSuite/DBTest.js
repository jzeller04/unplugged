//import { DynamoDBClient/*, ListTablesCommand*/ } from "@aws-sdk/client-dynamodb";
import { DBUser } from "../src/server/schema/userSchema.js";
import { scanWithEmail } from "../src/server/db/dbUtil.js";

// Make sure you are using DynamoDBClient (v3)
//const client = new DynamoDBClient({ region: "us-east-2" });

/*async function test() {
  const command = new ListTablesCommand({});
  const data = await client.send(command);  // send() exists here
  console.log("Tables:", data.TableNames);
}*/

async function testCreateAndDeleteUser() {
  const testUser = await DBUser.create({email: "test@unplugged.com", password: "password", name: "Dev"}, (data) => {
    console.log(data);
  });
  const pushed = await testUser.pushToDB();
  
  try {
    if(pushed)
    {
      console.log("Push user to DB passed");
    } else
    {
      console.log("Push user failed...");
    }
    const loggedIn = await testUser.login();
    if(loggedIn)
    {
      console.log("Login user to DB passed");
    } else
    {
      console.log("Login user failed...");
    }
    const foundUser = await scanWithEmail(testUser);
    if(foundUser)
    {
    console.log("Found user in DB passed");
    } else
    {
      console.log("Found user failed...");
    }
    const removedUser = await testUser.deleteFromDB();
    if(removedUser)
    {
      console.log("Delete user to DB passed");
    } else
    {
      console.log("Delete user failed...");
    }
  } catch (error) {
    console.log("Something fucked up");
  }
  
  
}

testCreateAndDeleteUser();
