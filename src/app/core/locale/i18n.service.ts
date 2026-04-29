import { Injectable, inject } from '@angular/core';
import type { PaymentMethod } from '../../data/models/domain.types';
import type { AppLocale } from './locale.service';
import { LocaleService } from './locale.service';
import { I18N, type I18nKey } from './i18n.dictionary';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly locale = inject(LocaleService);

  /**
   * Translated UI string. Reads locale signal so Angular tracks language changes.
   */
  t(key: I18nKey | (string & {})): string {
    this.locale.locale();
    const entry = I18N[key as I18nKey];
    if (!entry) {
      return key as string;
    }
    const lang: AppLocale = this.locale.locale() === 'fr' ? 'fr' : 'en';
    return lang === 'fr' ? entry.fr : entry.en;
  }

  /** Date/time respecting current UI language */
  formatDateTime(iso: string): string {
    this.locale.locale();
    const locale = this.locale.locale() === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  }

  /** Payment method label (cash, card, …) for badges and tables */
  paymentMethodLabel(m: PaymentMethod): string {
    const map: Record<PaymentMethod, I18nKey> = {
      CASH: 'sale.pay.cash',
      CARD: 'sale.pay.card',
      TRANSFER: 'sale.pay.transfer',
      OTHER: 'sale.pay.other',
    };
    return this.t(map[m]);
  }
}
