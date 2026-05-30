import pool from "../db.js";
import { askGeminiFinanceAssistant } from "../utils/gemini.js";

// ======================================
// GET CHAT HISTORY
// ======================================

export const getChatHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM ai_chat_messages
      WHERE user_id = $1
      ORDER BY created_at ASC
      LIMIT 100
      `,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GetChatHistory error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================
// ASK AI ASSISTANT
// ======================================

export const askFinanceAssistant = async (
  req,
  res
) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  try {
    // ======================================
    // USER INFO
    // ======================================

    const userRes = await pool.query(
      `
      SELECT currency
      FROM users
      WHERE id = $1
      `,
      [req.userId]
    );

    const currency =
      userRes.rows[0]?.currency || "USD";

    // ======================================
    // RECENT TRANSACTIONS
    // ======================================

    const txRes = await pool.query(
      `
      SELECT
        t.amount,
        t.type,
        t.description,
        t.transaction_date,
        c.name AS category
      FROM transactions t
      LEFT JOIN categories c
        ON c.id = t.category_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC
      LIMIT 50
      `,
      [req.userId]
    );

    // ======================================
    // RECURRING
    // ======================================

    const recurringRes = await pool.query(
      `
      SELECT
        title,
        amount,
        type,
        frequency
      FROM recurring_transactions
      WHERE user_id = $1
      `,
      [req.userId]
    );

    // ======================================
    // BUDGETS
    // ======================================

    const budgetRes = await pool.query(
      `
      SELECT
        c.name AS category,
        b.amount
      FROM budgets b
      JOIN categories c
        ON c.id = b.category_id
      WHERE b.user_id = $1
      `,
      [req.userId]
    );

    // ======================================
    // AI RESPONSE
    // ======================================

    const response =
      await askGeminiFinanceAssistant({
        question: message,
        transactions: txRes.rows,
        recurring: recurringRes.rows,
        budgets: budgetRes.rows,
        currency,
      });

    // ======================================
    // SAVE USER MESSAGE
    // ======================================

    await pool.query(
      `
      INSERT INTO ai_chat_messages
      (
        user_id,
        role,
        message
      )
      VALUES ($1, 'user', $2)
      `,
      [req.userId, message]
    );

    // ======================================
    // SAVE AI MESSAGE
    // ======================================

    await pool.query(
      `
      INSERT INTO ai_chat_messages
      (
        user_id,
        role,
        message
      )
      VALUES ($1, 'assistant', $2)
      `,
      [req.userId, response]
    );

    res.json({
      reply: response,
    });
  } catch (error) {
    console.error(
      "AskFinanceAssistant error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};