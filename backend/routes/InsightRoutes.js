import express from "express";

import {
  getInsights,
  generateInsight,
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

export default router;