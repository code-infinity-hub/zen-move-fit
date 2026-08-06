export const formatPaceDiff = (seconds: number): string => {
  const total = Math.floor(Math.abs(seconds));

  if (total < 60) return `${total}s`;

  const minutes = Math.floor(total / 60);
  const secs = total % 60;

  return `${minutes}:${String(secs).padStart(2, "0")}`;
};