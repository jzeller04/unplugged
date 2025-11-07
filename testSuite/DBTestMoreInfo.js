import { DBUser } from "../src/server/schema/userSchema.js";
import { scanWithEmail } from "../src/server/db/dbUtil.js";

async function testCreateAndDeleteUser() {
  console.log("=== Starting Create and Delete User Test ===");

  const testUser = await DBUser.create(
    { email: "test@unplugged.com", password: "password", name: "Dev" },
    (data) => {
      console.log("DBUser.create callback returned:", data);
    }
  );

  console.log("Created user object:", testUser);

  const pushed = await testUser.pushToDB();
  if (pushed) {
    console.log(`User added to DB: ${testUser.email} (${testUser.name})`);
  } else {
    console.log("Push user failed...");
  }

  try {
    const loggedIn = await testUser.login();
    if (loggedIn) {
      console.log(`Login successful for: ${testUser.email}`);
    } else {
      console.log(`Login failed for: ${testUser.email}`);
    }

    const foundUser = await scanWithEmail(testUser);
    if (foundUser) {
      console.log("Found user in DB:", JSON.stringify(foundUser, null, 2));
    } else {
      console.log(`Could not find user: ${testUser.email}`);
    }

    const removedUser = await testUser.deleteFromDB();
    if (removedUser) {
      console.log(`Deleted user from DB: ${testUser.email}`);
    } else {
      console.log(`Failed to delete user: ${testUser.email}`);
    }
  } catch (error) {
    console.error("Error during test:", error);
  }

  console.log("=== Finished Create and Delete User Test ===");
}


testCreateAndDeleteUser()