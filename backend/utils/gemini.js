import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "⚠️ WARNING: GEMINI_API_KEY is not set. AI features will not work."
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ==============================
// HELPER FUNCTION
// ==============================

const stripMarkdown = (text) => {
  if (!text) return "";

  let cleaned = text.trim();

  // Remove ```json
  cleaned = cleaned.replace(/```json/g, "");
  cleaned = cleaned.replace(/```/g, "");

  return cleaned.trim();
};

// ==============================
// MONTHLY INSIGHT
// ==============================

export const generateMonthlyInsight = async ({
  totalIncome,
  totalExpenses,
  savingsRate,
  expenseBreakdown,
  previousMonths,
  currency = "USD",
}) => {
  try {
    const breakdownText =
      expenseBreakdown?.length > 0
        ? expenseBreakdown
            .map(
              (c) =>
                `${c.category}: ${currency} ${Number(c.amount).toFixed(2)}`
            )
            .join("\n")
        : "No expense data available";

    const trendText =
      previousMonths?.length > 0
        ? previousMonths
            .map(
              (m) =>
                `${m.month}: Income ${currency} ${Number(
                  m.income
                ).toFixed(2)}, Expenses ${currency} ${Number(
                  m.expenses
                ).toFixed(2)}`
            )
            .join("\n")
        : "No previous trend data";

    const prompt = `
Analyze this user's monthly financial data and generate actionable insights.

Currency: ${currency}

Total Income: ${currency} ${Number(totalIncome).toFixed(2)}
Total Expenses: ${currency} ${Number(totalExpenses).toFixed(2)}
Savings Rate: ${Number(savingsRate).toFixed(1)}%

Expense Breakdown:
${breakdownText}

Previous Trends:
${trendText}

Return ONLY valid JSON in this exact format:

{
  "summary": "2-3 sentence financial summary",
  "highlights": ["highlight 1", "highlight 2"],
  "concerns": ["concern 1", "concern 2"],
  "recommendations": [
    {
      "title": "Short title",
      "detail": "Actionable suggestion"
    }
  ],
  "topSpendingCategory": "category",
  "estimatedMonthlySavings": 120,
  "healthScore": 78
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini monthly insight error:", error);

    return {
      summary: "Unable to generate AI summary right now.",
      highlights: [],
      concerns: [],
      recommendations: [],
      topSpendingCategory: null,
      estimatedMonthlySavings: 0,
      healthScore: 50,
    };
  }
};

// ==============================
// BUDGET ALERT
// ==============================

export const generateBudgetAlert = async ({
  categoryName,
  budgetAmount,
  spentAmount,
  daysIntoPeriod,
  totalPeriodDays,
  currency = "USD",
}) => {
  try {
    const percentUsed = (
      (spentAmount / budgetAmount) *
      100
    ).toFixed(1);

    const daysLeft = totalPeriodDays - daysIntoPeriod;

    const prompt = `
A user is tracking a budget.

Category: ${categoryName}
Budget: ${currency} ${budgetAmount}
Spent: ${currency} ${spentAmount}
Used: ${percentUsed}%
Days Left: ${daysLeft}

Return ONLY valid JSON:

{
  "severity": "info",
  "title": "Short title",
  "message": "Helpful budget alert message",
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini budget alert error:", error);

    return {
      severity: "info",
      title: "Budget Tracking",
      message: "Unable to generate AI budget alert.",
      suggestions: [],
    };
  }
};

// ==============================
// SAVINGS TIPS
// ==============================

export const generateSavingsTips = async ({
  topCategories,
  monthlyIncome,
  currency = "USD",
}) => {
  try {
    const categoryText =
      topCategories?.length > 0
        ? topCategories
            .map(
              (c) =>
                `${c.category}: ${currency} ${Number(c.amount).toFixed(2)}`
            )
            .join("\n")
        : "No category data";

    const prompt = `
Generate personalized savings tips.

Monthly Income:
${currency} ${monthlyIncome}

Top Categories:
${categoryText}

Return ONLY valid JSON:

{
  "overallTip": "General advice",
  "tips": [
    {
      "category": "Food",
      "title": "Reduce dining",
      "detail": "Cook more meals at home",
      "estimatedSavings": 100
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini savings tips error:", error);

    return {
      overallTip: "Unable to generate savings tips.",
      tips: [],
    };
  }
};

// ==============================
// TRANSACTION ANALYSIS
// ==============================

export const analyzeTransactionsList = async ({
  transactions,
  currency = "USD",
}) => {
  try {
    const lines = transactions
      .slice(0, 50)
      .map((t) => {
        return `${t.type} | ${currency} ${t.amount} | ${
          t.category_name || "Uncategorized"
        }`;
      })
      .join("\n");

    const prompt = `
Analyze these transactions:

${lines}

Return ONLY valid JSON:

{
  "insight": "2-4 sentence insight",
  "highlight": "short takeaway"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini transaction analysis error:", error);

    return {
      insight: "Unable to analyze transactions.",
      highlight: "No insight available",
    };
  }
};

// ==============================
// BUDGET ANALYSIS
// ==============================

export const analyzeBudgetList = async ({
  budgets,
  currency = "USD",
}) => {
  try {
    const lines = budgets
      .map((b) => {
        const spent = Number(b.spent || 0);
        const total = Number(b.amount || 0);

        const pct =
          total > 0 ? ((spent / total) * 100).toFixed(1) : 0;

        return `
Category: ${b.category_name}
Budget: ${currency} ${total}
Spent: ${currency} ${spent}
Used: ${pct}%
`;
      })
      .join("\n");

    const prompt = `
Analyze these budgets:

${lines}

Return ONLY valid JSON:

{
  "analyses": [
    {
      "budgetId": 1,
      "status": "good",
      "message": "Budget looks healthy"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const cleaned = stripMarkdown(response.text);

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini budget analysis error:", error);

    return {
      analyses: [],
    };
  }
};

// ==============================
// EXPORTS
// ==============================

export default {
  generateMonthlyInsight,
  generateBudgetAlert,
  generateSavingsTips,
  analyzeTransactionsList,
  analyzeBudgetList,
};