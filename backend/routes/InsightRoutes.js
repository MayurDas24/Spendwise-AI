//backend/routes/insightRoutes.js
import express from "express";

import {
  getInsights,
  generateInsight,
  askFinanceAssistant,
  getChatHistory,
} from "../controllers/insightController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// =======================================
// PROTECTED ROUTES
// =======================================

router.use(protect);

// =======================================
// GET ALL INSIGHTS
// =======================================

router.get("/", getInsights);

// =======================================
// GENERATE AI INSIGHT
// =======================================

router.post("/generate", generateInsight);
router.post("/chat", askFinanceAssistant);
router.get("/chat/history", getChatHistory);

export default router;

