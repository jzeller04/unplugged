import {pushUser} from "./db/dbUtil.js";
import { hash, verify } from "argon2-browser";

// make class with push/update function for DB. will make coding easier

class DBUser {
    
    static async create(userInfo) {
        
        if (!userInfo.userId || !userInfo.email || !userInfo.hashword) {
            throw new Error("User object missing required fields.");
        }

        const hashword = await hash(userInfo.password);
        const user = new DBUser(); // empty instance
        user.userId = userInfo.userId;
        user.email = userInfo.email;
        user.hashword = hashword;
        return user;
    }

    async pushToDB() {
        await pushUser(this);
    }

    // need to add update function
}


// async function test() {
//     const command = new PutItemCommand({
//         TableName: "Unplugged-Users",
//         Item: {
//             userId: { S: "TestID12345" },
//             email: { S: "dev@unplugged.com" },
//             hashedPassword: { S: "password" }
//         }
//     })

//     await client.send(command);
//     console.log("Test user added ✅");

//     const scanCommand = new ScanCommand({ TableName: "Unplugged-Users" });
//     const data = await client.send(scanCommand);

//     console.log("All users in table:", data.Items);
// }


// test();
