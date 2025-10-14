import express from "express";
import { DBUser } from "../schema/userSchema.js";

const router = express.Router();

// // POST /users
router.post("/register", async (req, res) => {
  try {
    console.log("Received register request:", req.body);

    const newUser = await DBUser.create(req.body);
    await newUser.pushToDB();

    // Send a success response
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

export default router;

