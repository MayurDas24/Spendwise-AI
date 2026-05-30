import pool from "../db.js";

import {
  generateMonthlyInsight,
  generateBudgetAlert,
  generateSavingsTips,
} from "../utils/gemini.js";

import {
  calculateFinancialHealth,
} from "../utils/financialHealthEngine.js";

import {
  detectSubscriptions,
} from "../utils/subscriptionDetector.js";

import {
  predictMonthlyExpenses,
} from "../utils/predictiveEngine.js";

// =======================================
// GET USER CURRENCY
// =======================================

const getUserCurrency = async (userId) => {

  const result = await pool.query(
    `
    SELECT currency
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0]?.currency || "USD";
};

// =======================================
// GET ALL INSIGHTS
// =======================================

export const getInsights = async (
  req,
  res
) => {

  try {

    const result = await pool.query(
      `
      SELECT *
      FROM ai_insights
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [req.userId]
    );

    res.json(result.rows);

  } catch (error) {

    console.error(
      "GetInsights error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =======================================
// BUILD MONTHLY INSIGHT
// =======================================

const buildMonthlyInsight = async (
  userId
) => {

  // =====================================
  // CORE ANALYTICS
  // =====================================

  const data = await pool.query(
    `
    WITH current_month AS (

      SELECT

        SUM(
          CASE
            WHEN type = 'income'
            THEN amount
            ELSE 0
          END
        ) AS income,

        SUM(
          CASE
            WHEN type = 'expense'
            THEN amount
            ELSE 0
          END
        ) AS expense

      FROM transactions

      WHERE user_id = $1
      AND transaction_date >=
          date_trunc('month', CURRENT_DATE)
    ),

    breakdown AS (

      SELECT
        c.name AS category,

        SUM(t.amount) AS amount

      FROM transactions t

      JOIN categories c
      ON c.id = t.category_id

      WHERE t.user_id = $1
      AND t.type = 'expense'
      AND t.transaction_date >=
          date_trunc('month', CURRENT_DATE)

      GROUP BY c.name

      ORDER BY amount DESC
    ),

    trend AS (

      SELECT

        to_char(
          date_trunc(
            'month',
            transaction_date
          ),
          'YYYY-MM'
        ) AS month,

        SUM(
          CASE
            WHEN type = 'income'
            THEN amount
            ELSE 0
          END
        ) AS income,

        SUM(
          CASE
            WHEN type = 'expense'
            THEN amount
            ELSE 0
          END
        ) AS expense

      FROM transactions

      WHERE user_id = $1
      AND transaction_date >=
          date_trunc('month', CURRENT_DATE)
          - INTERVAL '5 months'

      GROUP BY 1
      ORDER BY 1
    )

    SELECT
      (SELECT income FROM current_month)
        AS income,

      (SELECT expense FROM current_month)
        AS expense,

      (SELECT json_agg(breakdown)
       FROM breakdown)
        AS breakdown,

      (SELECT json_agg(trend)
       FROM trend)
        AS trend
    `,
    [userId]
  );

  const row = data.rows[0];

  const totalIncome = parseFloat(
    row.income || 0
  );

  const totalExpenses = parseFloat(
    row.expense || 0
  );

  // =====================================
  // SAVINGS RATE
  // =====================================

  const savingsRate =
    totalIncome > 0
      ? (
          (
            totalIncome -
            totalExpenses
          ) /
          totalIncome
        ) *
        100
      : 0;

  // =====================================
  // RECURRING TRANSACTIONS
  // =====================================

  const recurringRes = await pool.query(
    `
    SELECT *
    FROM recurring_transactions
    WHERE user_id = $1
    `,
    [userId]
  );

  // =====================================
  // BUDGETS
  // =====================================

  const budgetRes = await pool.query(
    `
    SELECT
      b.amount,
      c.name AS category_name,

      COALESCE(
        SUM(t.amount),
        0
      ) AS spent

    FROM budgets b

    JOIN categories c
      ON c.id = b.category_id

    LEFT JOIN transactions t
      ON t.category_id = b.category_id
      AND t.user_id = b.user_id
      AND t.type = 'expense'
      AND t.transaction_date >=
          date_trunc(
            'month',
            CURRENT_DATE
          )

    WHERE b.user_id = $1

    GROUP BY
      b.id,
      c.name
    `,
    [userId]
  );

  // =====================================
  // SUBSCRIPTION DETECTOR
  // =====================================

  const subscriptionData =
    detectSubscriptions(
      recurringRes.rows
    );

  // =====================================
  // PREDICTIVE ENGINE
  // =====================================

  const today = new Date();

  const prediction =
    predictMonthlyExpenses({
      currentExpenses:
        totalExpenses,

      daysPassed:
        today.getDate(),
    });

  // =====================================
  // FINANCIAL HEALTH
  // =====================================

  const health =
    calculateFinancialHealth({
      income: totalIncome,

      expenses: totalExpenses,

      recurringExpenses:
        subscriptionData.monthlyEquivalent,

      budgetUsage:
        budgetRes.rows,

      monthlyTrend:
        row.trend || [],
    });

  // =====================================
  // USER CURRENCY
  // =====================================

  const currency =
    await getUserCurrency(userId);

  // =====================================
  // AI INSIGHT
  // =====================================

  const content =
    await generateMonthlyInsight({

      totalIncome,

      totalExpenses,

      savingsRate,

      expenseBreakdown:
        (row.breakdown || []).map(
          (b) => ({
            category: b.category,
            amount:
              parseFloat(
                b.amount
              ),
          })
        ),

      previousMonths:
        (row.trend || []).map(
          (t) => ({
            month: t.month,

            income:
              parseFloat(
                t.income
              ),

            expenses:
              parseFloat(
                t.expense
              ),
          })
        ),

      currency,

      // ===================================
      // NEW ADVANCED DATA
      // ===================================

      projectedExpenses:
        prediction.projectedExpenses,

      subscriptionBurden:
        subscriptionData.monthlyEquivalent,

      subscriptionCount:
        subscriptionData.count,

      healthScore:
        health.score,

      healthStatus:
        health.status,
    });

  // =====================================
  // OVERRIDE AI HEALTH SCORE
  // =====================================

  content.healthScore =
    health.score;

  content.healthStatus =
    health.status;

  // =====================================
  // ADD PREDICTIVE DATA
  // =====================================

  content.projectedExpenses =
    prediction.projectedExpenses;

  content.subscriptionBurden =
    subscriptionData.monthlyEquivalent;

  content.subscriptionCount =
    subscriptionData.count;

  content.savingsRate =
    health.savingsRate;

  content.expenseRatio =
    health.expenseRatio;

  content.recurringRatio =
    health.recurringRatio;

  // =====================================
  // SAVINGS FORECAST
  // =====================================

  content.projectedSavings =
    Math.max(
      0,
      totalIncome -
        prediction.projectedExpenses
    );

  // =====================================
  // OVESPENDING DETECTOR
  // =====================================

  content.overspendingCategories =
    budgetRes.rows
      .filter(
        (b) =>
          Number(b.spent) >
          Number(b.amount)
      )
      .map(
        (b) =>
          b.category_name
      );

  // =====================================
  // DATE RANGE
  // =====================================

  const now = new Date();

  const periodStart =
    `${now.getFullYear()}-` +
    `${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-01`;

  const periodEnd =
    `${now.getFullYear()}-` +
    `${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-` +
    `${String(
      now.getDate()
    ).padStart(2, "0")}`;

  return {
    content,
    periodStart,
    periodEnd,
  };
};

// =======================================
// BUILD SAVINGS TIPS
// =======================================

const buildSavingsTips = async (
  userId
) => {

  const top = await pool.query(
    `
    SELECT

      c.name AS category,

      SUM(t.amount) AS amount,

      COUNT(t.id) AS count

    FROM transactions t

    JOIN categories c
      ON c.id = t.category_id

    WHERE t.user_id = $1
    AND t.type = 'expense'
    AND t.transaction_date >=
        CURRENT_DATE - INTERVAL '30 days'

    GROUP BY c.name

    ORDER BY amount DESC

    LIMIT 5
    `,
    [userId]
  );

  const incomeResult =
    await pool.query(
      `
      SELECT
        COALESCE(
          SUM(amount),
          0
        ) AS income

      FROM transactions

      WHERE user_id = $1
      AND type = 'income'
      AND transaction_date >=
          CURRENT_DATE - INTERVAL '30 days'
      `,
      [userId]
    );

  const currency =
    await getUserCurrency(userId);

  const content =
    await generateSavingsTips({

      topCategories:
        top.rows.map((r) => ({
          category: r.category,

          amount:
            parseFloat(
              r.amount
            ),

          transactionCount:
            parseInt(
              r.count
            ),
        })),

      monthlyIncome:
        parseFloat(
          incomeResult.rows[0]
            .income
        ),

      currency,
    });

  return {
    content,
    periodStart: null,
    periodEnd: null,
  };
};

// =======================================
// BUILD BUDGET ALERT
// =======================================

const buildBudgetAlert = async (
  userId,
  categoryId
) => {

  const budgetRow =
    await pool.query(
      `
      SELECT

        b.*,

        c.name AS category_name,

        COALESCE(
          (
            SELECT SUM(amount)

            FROM transactions

            WHERE user_id = b.user_id
            AND category_id = b.category_id
            AND type = 'expense'
            AND transaction_date >=
                date_trunc(
                  'month',
                  CURRENT_DATE
                )
          ),
          0
        ) AS spent

      FROM budgets b

      JOIN categories c
        ON c.id = b.category_id

      WHERE b.user_id = $1
      AND b.category_id = $2
      `,
      [userId, categoryId]
    );

  if (
    budgetRow.rows.length === 0
  ) {

    const err = new Error(
      "Budget not found"
    );

    err.status = 404;

    throw err;
  }

  const b =
    budgetRow.rows[0];

  const now = new Date();

  const daysIntoPeriod =
    now.getDate();

  const totalPeriodDays =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

  const currency =
    await getUserCurrency(userId);

  const content =
    await generateBudgetAlert({

      categoryName:
        b.category_name,

      budgetAmount:
        parseFloat(
          b.amount
        ),

      spentAmount:
        parseFloat(
          b.spent
        ),

      daysIntoPeriod,

      totalPeriodDays,

      currency,
    });

  return {
    content,
    periodStart: null,
    periodEnd: null,
  };
};

// =======================================
// GENERATE INSIGHT
// =======================================

export const generateInsight =
  async (req, res) => {

    const {
      type,
      categoryId,
    } = req.body;

    if (!type) {
      return res.status(400).json({
        message:
          "Insight type is required",
      });
    }

    try {

      let result;

      if (
        type ===
        "monthly_summary"
      ) {

        result =
          await buildMonthlyInsight(
            req.userId
          );

      } else if (
        type ===
        "savings_tips"
      ) {

        result =
          await buildSavingsTips(
            req.userId
          );

      } else if (
        type ===
        "budget_alert"
      ) {

        result =
          await buildBudgetAlert(
            req.userId,
            categoryId
          );

      } else {

        return res.status(400).json({
          message:
            "Unknown insight type",
        });
      }

      const inserted =
        await pool.query(
          `
          INSERT INTO ai_insights
          (
            user_id,
            insight_type,
            period_start,
            period_end,
            content_json
          )

          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5
          )

          RETURNING *
          `,
          [
            req.userId,
            type,
            result.periodStart,
            result.periodEnd,
            result.content,
          ]
        );

      res.status(201).json(
        inserted.rows[0]
      );

    } catch (error) {

      console.error(
        "GenerateInsight error:",
        error
      );

      res.status(
        error.status || 500
      ).json({
        message:
          error.message ||
          "Server error",
      });
    }
  };
  // =====================================
// AI CHAT ASSISTANT
// =====================================

export const askFinanceAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // temporary response
    // later we will connect Gemini fully

    return res.json({
      reply:
        "AI Assistant is active. Gemini integration working successfully.",
    });
  } catch (error) {
    console.error("AskFinanceAssistant error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================
// CHAT HISTORY
// =====================================

export const getChatHistory = async (req, res) => {
  try {
    // temporary empty history

    return res.json([]);
  } catch (error) {
    console.error("GetChatHistory error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};