// =========================================
// SUBSCRIPTION DETECTOR
// =========================================

export const detectSubscriptions = (
  recurring = []
) => {

  const subscriptions =
    recurring.filter(
      (r) =>
        r.type === "expense" &&
        [
          "monthly",
          "yearly",
          "quarterly",
          "semi-annually",
        ].includes(r.frequency)
    );

  const totalMonthlyEquivalent =
    subscriptions.reduce((sum, s) => {

      const amount = Number(s.amount);

      switch (s.frequency) {

        case "monthly":
          return sum + amount;

        case "yearly":
          return sum + amount / 12;

        case "quarterly":
          return sum + amount / 3;

        case "semi-annually":
          return sum + amount / 6;

        default:
          return sum;
      }
    }, 0);

  return {
    count: subscriptions.length,
    subscriptions,
    monthlyEquivalent:
      totalMonthlyEquivalent,
  };
};