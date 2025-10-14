import express from "express";
import userRoutes from "./routes/users.js";

const app = express();
app.use(express.json());

// Mount routes
app.use("/users", userRoutes);

// const PORT = process.env.PORT || 8081;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});