/** Mirrors backend split: barber rounded half-up to 2dp, shop gets remainder. */
export function splitEarnings(total: number, commissionPercent: number): {
  barberEarning: number;
  shopEarning: number;
} {
  const barberEarning = Math.round(total * (commissionPercent / 100) * 100) / 100;
  const shopEarning = Math.round((total - barberEarning) * 100) / 100;
  return { barberEarning, shopEarning };
}
