import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import transactionRoutes from "./routes/transactionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import insightRoutes from "./routes/InsightRoutes.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());

app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "AI Expense Tracker API is running",
  });
});

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/insights", insightRoutes);
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});