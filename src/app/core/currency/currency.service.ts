import { Injectable, computed, signal } from '@angular/core';
import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export type DisplayCurrencyCode = 'USD' | 'CDF';

const STORAGE_KEY = 'mubase.currency';

/**
 * Congolese francs per 1 USD — used only for CDF display and for converting
 * amounts typed in CDF back to stored USD values. Adjust when rates change.
 */
const DEFAULT_CDF_PER_USD = 2850;

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  /** Amounts in the mock DB remain in USD; this only affects UI. */
  readonly displayCurrency = signal<DisplayCurrencyCode>(this.readInitial());

  /** FC per $1 — extend later (e.g. settings) if you need a live rate. */
  readonly cdfPerUsd = signal(DEFAULT_CDF_PER_USD);

  readonly amountStep = computed(() => (this.displayCurrency() === 'USD' ? 0.01 : 1));

  readonly amountLabelSuffix = computed(() => (this.displayCurrency() === 'USD' ? 'USD' : 'CDF'));

  amountStepFor(mode: DisplayCurrencyCode): number {
    return mode === 'USD' ? 0.01 : 1;
  }

  amountLabelFor(mode: DisplayCurrencyCode): string {
    return mode === 'USD' ? 'USD' : 'CDF';
  }

  setDisplayCurrency(next: DisplayCurrencyCode): void {
    this.displayCurrency.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  /** Stored USD → formatted string. Optional `mode` skips app header preference (e.g. catalog list price). */
  format(amountUsd: number, mode?: DisplayCurrencyCode): string {
    const useMode = mode ?? this.displayCurrency();
    if (useMode === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amountUsd);
    }
    const cdf = amountUsd * this.cdfPerUsd();
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cdf);
  }

  /** Stored USD → number shown in amount inputs for the given currency mode. */
  displayAmountFromUsd(usd: number, mode?: DisplayCurrencyCode): number {
    const useMode = mode ?? this.displayCurrency();
    if (useMode === 'USD') {
      return usd;
    }
    return Math.round(usd * this.cdfPerUsd());
  }

  /** Typed amount in `mode` → USD for persistence. */
  usdFromDisplayAmount(displayAmount: number, mode?: DisplayCurrencyCode): number {
    const useMode = mode ?? this.displayCurrency();
    if (useMode === 'USD') {
      return displayAmount;
    }
    return displayAmount / this.cdfPerUsd();
  }

  private readInitial(): DisplayCurrencyCode {
    if (typeof localStorage === 'undefined') {
      return 'USD';
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'CDF' ? 'CDF' : 'USD';
  }

  /**
   * Min $0.01 USD equivalent for amount inputs.
   * Optional resolver when the visible currency differs from `displayCurrency()` (sale form, catalog form).
   */
  minUsdAmountValidator(amountMode?: () => DisplayCurrencyCode): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const mode = amountMode?.() ?? this.displayCurrency();
      const usd = this.usdFromDisplayAmount(Number(control.value) || 0, mode);
      return usd >= 0.01 ? null : { minAmount: true };
    };
  }
}
