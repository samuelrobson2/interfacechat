// TODO: Replace with real data from API
export function useCredits() {
  const totalAmount = 15000;
  const usersCredits = 20000;
  const isNotEnoughCredits = totalAmount > usersCredits;

  return {
    usersCredits,
    totalAmount,
    isNotEnoughCredits,
    remainingCredits: totalAmount - usersCredits,
  };
}
