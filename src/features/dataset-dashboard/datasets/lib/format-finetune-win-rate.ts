export function formatFinetuneWinRatePct(
  winRates: { finetuned_model_win_rate_pct?: number } | null | undefined,
): string {
  const pct = winRates?.finetuned_model_win_rate_pct;
  if (pct == null) return "—";
  return `${Math.round(pct)}%`;
}
