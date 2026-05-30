import express from "express";

import {
  askFinanceAssistant,
  getChatHistory,
} from "../controllers/aiChatController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", askFinanceAssistant);

router.get("/history", getChatHistory);

export default router;