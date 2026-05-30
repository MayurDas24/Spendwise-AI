//backend/routes/transactionRoutes.js
import express from "express";
import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  analyzeTransactions,

  createRecurringTransaction,
  getRecurringTransactions,
  deleteRecurringTransaction,

} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all transaction routes
router.use(protect);

// Routes
router.get("/", getTransactions);

router.post("/", createTransaction);
router.post("/analyze", analyzeTransactions);
// ==============================
// RECURRING TRANSACTIONS
// ==============================

router.get("/recurring/all", getRecurringTransactions);

router.post("/recurring/create", createRecurringTransaction);

router.delete(
  "/recurring/:id",
  deleteRecurringTransaction
);
router.get("/:id", getTransactionById);

router.put("/:id", updateTransaction);

router.delete("/:id", deleteTransaction);

export default router;