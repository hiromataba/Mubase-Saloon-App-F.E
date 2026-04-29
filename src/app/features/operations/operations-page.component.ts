import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/locale/i18n.service';
import type { TransactionListItem } from '../../data/models/domain.types';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { formatUsd } from '../../shared/formatters';
import { NewSaleFormComponent } from './new-sale-form.component';

@Component({
  standalone: true,
  selector: 'app-operations-page',
  imports: [MbCardComponent, MbButtonComponent, NewSaleFormComponent],
  template: `
    <div class="mx-auto max-w-4xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">{{ i18n.t('operations.title') }}</h1>
          <p class="mb-page-sub">{{ i18n.t('operations.subtitle') }}</p>
        </div>
        <mb-btn variant="secondary" (click)="go('/transactions')">{{ i18n.t('operations.viewTx') }}</mb-btn>
      </div>

      @if (last(); as row) {
        <mb-card [title]="i18n.t('operations.lastPosted')" [subtitle]="i18n.t('operations.sessionHint')">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">{{ row.customerNameSnapshot }}</p>
              <p class="text-sm text-slate-500">
                {{ row.receipt?.receiptNumber }} · {{ i18n.formatDateTime(row.paymentDate) }}
              </p>
            </div>
            <p class="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {{ formatUsd(row.totalAmount) }}
            </p>
          </div>
        </mb-card>
      }

      <app-new-sale-form (saved)="last.set($event)" />
    </div>
  `,
})
export class OperationsPageComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly formatUsd = formatUsd;
  readonly last = signal<TransactionListItem | null>(null);

  ngOnInit(): void {
    if (!this.auth.canOperateFrontDesk()) {
      void this.router.navigateByUrl('/my-desk', { replaceUrl: true });
    }
  }

  go(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
