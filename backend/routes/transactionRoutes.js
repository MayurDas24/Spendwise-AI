import express from "express";

import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all transaction routes
router.use(protect);

// Routes
router.get("/", getTransactions);

router.post("/", createTransaction);

router.get("/:id", getTransactionById);

router.put("/:id", updateTransaction);

router.delete("/:id", deleteTransaction);

export default router;