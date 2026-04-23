import type { PaymentMethod } from '../data/models/domain.types';

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPct(p: number): string {
  return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function paymentMethodLabel(m: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    CASH: 'Cash',
    CARD: 'Card',
    TRANSFER: 'Transfer',
    OTHER: 'Other',
  };
  return map[m];
}

/** Badge tone for payment method pills (presentation only). */
export function paymentMethodBadgeTone(
  m: PaymentMethod,
): 'neutral' | 'info' | 'warning' | 'success' {
  const map: Record<PaymentMethod, 'neutral' | 'info' | 'warning' | 'success'> = {
    CASH: 'neutral',
    CARD: 'info',
    TRANSFER: 'warning',
    OTHER: 'success',
  };
  return map[m];
}
