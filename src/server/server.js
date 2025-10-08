const express = require("express");
const userRoutes = require("./routes/users");

const app = express();
app.use(express.json());

// Mount routes
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
