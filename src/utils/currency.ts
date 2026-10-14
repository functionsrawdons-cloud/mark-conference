/**
 * Formatter for South African Rands (ZAR / R)
 */
export const CURRENCY_SYMBOL = 'R';

export function formatZAR(amount: number | null | undefined, includeDecimals: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }

  const formatted = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);

  return `R ${formatted}`;
}

export function formatZARDiff(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-ZA', {
    maximumFractionDigits: 0,
  }).format(abs);

  if (amount > 0) {
    return `+R ${formatted}`;
  } else if (amount < 0) {
    return `-R ${formatted}`;
  }
  return `R 0`;
}
