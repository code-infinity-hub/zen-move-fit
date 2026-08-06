export const calculatePercentageXp = (currentXp: number, maxXp: number) => {
  return Math.floor((currentXp / maxXp) * 100);
};