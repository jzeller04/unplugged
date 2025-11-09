import express from "express";
import { DBUser } from "../schema/userSchema.js";

const router = express.Router();

// // POST /users
router.post("/register", async (req, res) => {
  try {
    console.log("Received register request:", req.body);

    const newUser = await DBUser.create(req.body);
    const pushed = await newUser.pushToDB();

    if(pushed)
    {
      res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser
      });
    }
    else
    {
      res.status(500).json({
      success: false,
      message: "User already exists",
    });
    }

    // Send a success response
   
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

router.post("/signin", async (req, res) => {
  try {
    console.log("Received sign in request:", req.body);

    const newUser = await DBUser.create(req.body);
    //console.log("newUser:", newUser);
    const success = await newUser.login();



    // Send a success response
    if(success)
    {

      const userData = await newUser.getJSON();

      console.log(userData);

      res.status(201).json({
      success: true,
      message: "User signed in",
      user: userData
      });
    } else
    {
      res.status(500).json({
        success: false,
        message: "Incorrect Credentials",
        user: newUser
      });
    }
   
  } catch (error) {
    console.error("Error logging in user (server):", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

router.post("/delete", async (req, res) => {
  // should add some try in here, tdl lowkey!!!!!
    const userToDelete = await DBUser.create(req.body);
    //console.log("Deleting user...", userToDelete.email);
    const loggedIn = await userToDelete.login();
    if(loggedIn)
    {
      userToDelete.deleteFromDB();
        res.status(201).json({
      success: true,
      message: "User deleted"
      });
    }
    else
    {
      req.status(201).json({
        success: false,
        message: "Incorrect password"
      });
    }
      

});



export default router;

