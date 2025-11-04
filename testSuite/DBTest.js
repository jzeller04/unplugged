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
// test incorrect cases
async function testCreateAndDeleteUser() {
  const testUser = await DBUser.create({email: "test@unplugged.com", password: "password", name: "Dev"}, (data) => {
    console.log(data);
  });
  const pushed = await testUser.pushToDB();
  
  try {
    if(pushed)
    {
      console.log(console.log("\x1b[32mPushing user passed\x1b[0m"));
    } else
    {
      console.error("\x1b[31mError pushing user to DB\x1b[0m");
    }
    const loggedIn = await testUser.login();
    if(loggedIn)
    {
      console.log("\x1b[32mLog in of user passed\x1b[0m");
    } else
    {
      console.error("\x1b[31mELogging in user failed\x1b[0m");
    }
    const foundUser = await scanWithEmail(testUser);
    if(foundUser)
    {
      console.log("\x1b[32mFind user in DB passed\x1b[0m");
    } else
    {
      console.error("\x1b[31mFinding user failed\x1b[0m");
    }
    const updatedStreak = await testUser.calculateStreaksAndUpdate();
    if(updatedStreak)
    {
      console.log("\x1b[32mUpdate user streaks in DB passed\x1b[0m");
    } else
    {
      console.error("\x1b[31mUpdating user streaks failed\x1b[0m");
    }
    const removedUser = await testUser.deleteFromDB();
    if(removedUser)
    {
      console.log("\x1b[32mDelete user in DB passed\x1b[0m");
    } else
    {
      console.error("\x1b[31mDeleting user failed\x1b[0m");
    }
  } catch (error) {
    console.error("Something messed up");
  }
  
  
}

testCreateAndDeleteUser();
