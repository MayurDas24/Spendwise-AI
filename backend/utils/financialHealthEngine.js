// =========================================
// FINANCIAL HEALTH ENGINE
// =========================================

export const calculateFinancialHealth = ({
  income = 0,
  expenses = 0,
  recurringExpenses = 0,
  budgetUsage = [],
  monthlyTrend = [],
}) => {

  let score = 100;

  // =====================================
  // SAVINGS RATE
  // =====================================

  const savingsRate =
    income > 0
      ? ((income - expenses) / income) * 100
      : 0;

  if (savingsRate < 0) score -= 35;
  else if (savingsRate < 10) score -= 20;
  else if (savingsRate < 20) score -= 10;

  // =====================================
  // EXPENSE RATIO
  // =====================================

  const expenseRatio =
    income > 0
      ? (expenses / income) * 100
      : 100;

  if (expenseRatio > 90) score -= 20;
  else if (expenseRatio > 75) score -= 10;

  // =====================================
  // RECURRING BURDEN
  // =====================================

  const recurringRatio =
    income > 0
      ? (recurringExpenses / income) * 100
      : 0;

  if (recurringRatio > 60) score -= 15;
  else if (recurringRatio > 40) score -= 8;

  // =====================================
  // BUDGET DISCIPLINE
  // =====================================

  const overBudgetCount =
    budgetUsage.filter(
      (b) => Number(b.spent) > Number(b.amount)
    ).length;

  score -= overBudgetCount * 5;

  // =====================================
  // TREND STABILITY
  // =====================================

  if (monthlyTrend.length >= 3) {

    const expenseChanges = [];

    for (let i = 1; i < monthlyTrend.length; i++) {

      const prev = Number(
        monthlyTrend[i - 1].expense || 0
      );

      const curr = Number(
        monthlyTrend[i].expense || 0
      );

      if (prev > 0) {

        expenseChanges.push(
          Math.abs((curr - prev) / prev)
        );
      }
    }

    const volatility =
      expenseChanges.reduce(
        (a, b) => a + b,
        0
      ) / (expenseChanges.length || 1);

    if (volatility > 0.5) score -= 10;
    else if (volatility > 0.3) score -= 5;
  }

  // =====================================
  // LIMITS
  // =====================================

  score = Math.max(
    0,
    Math.min(100, score)
  );

  // =====================================
  // STATUS
  // =====================================

  let status = "Excellent";

  if (score < 40) {
    status = "Risky";
  } else if (score < 70) {
    status = "Moderate";
  }

  return {
    score,
    status,
    savingsRate,
    expenseRatio,
    recurringRatio,
  };
};