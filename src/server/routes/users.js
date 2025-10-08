const express = require("express");
const { addUser, getUser } = require("../db");

const router = express.Router();

// // POST /users
// router.post("/", async (req, res) => {
//   try {
//     await addUser(req.body);
//     res.json({ success: true, user: req.body });
//   } catch (err) {
//     console.error("Error adding user:", err);
//     res.status(500).json({ error: "Failed to add user" });
//   }
// });

// // GET /users/:id
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await getUser(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json(user);
//   } catch (err) {
//     console.error("Error fetching user:", err);
//     res.status(500).json({ error: "Failed to fetch user" });
//   }
// });

// module.exports = router;
