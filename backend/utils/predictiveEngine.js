// =========================================
// PREDICTIVE ENGINE
// =========================================

export const predictMonthlyExpenses = ({
  currentExpenses = 0,
  daysPassed = 1,
}) => {

  const today = new Date();

  const daysInMonth =
    new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

  const projected =
    (currentExpenses / daysPassed) *
    daysInMonth;

  return {
    projectedExpenses:
      Number(projected.toFixed(2)),
  };
};