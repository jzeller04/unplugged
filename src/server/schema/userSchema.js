import {pushUser, scanWithEmail} from "../db/dbUtil.js";
import argon2 from "argon2";
import { v4 as uuidv4 } from 'uuid';

// make class with push/update function for DB. will make coding easier for those looking

class DBUser {
    
    static async create(userInfo) {
        const user = new DBUser(); // empty instance
        user.userId = uuidv4();
        if (!user.userId) {
            throw new Error("User object missing required field: userId");
        }

        if (!isValidEmail(userInfo.email)) {
            throw new Error("User object missing or invalid field: email");
        }

        if (!userInfo.password) {
            throw new Error("User object missing required field: password");
        }

        const hashword = await argon2.hash(userInfo.password);

        user.password = userInfo.password;


        user.name = userInfo.name;
        user.email = userInfo.email;
        user.hashword = hashword;
        return user;
    }

    async pushToDB() {
        const pushed = await pushUser(this);
        return !!pushed;
    }

    async update()
    {
        // TDL
    }
    
    async login()
    {
        const tsUser = await scanWithEmail(this)
        if(!tsUser) return false;

        const storedHash = tsUser.hashedPassword?.S;

        console.log("🧂 storedHash:", storedHash);
        console.log("🔑 plain password:", this.password);

        if (!storedHash || typeof storedHash !== "string" || !storedHash.startsWith("$argon2")) {
        console.error("❌ Invalid or missing hash from DB for user:", this.email);
        return false;
}
        const passwordMatches = await argon2.verify(storedHash, this.password);
        
        if(passwordMatches) {return true;}
        else {console.log("User tried logged in with incorrect password...", this.email); return false;}
    }

    // need to add update function
}

function isValidEmail(email)
{
    if(typeof email === "string")
    {
        // Simple regex for email validation (thank you GPT!!!)
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
}

export {DBUser};
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
