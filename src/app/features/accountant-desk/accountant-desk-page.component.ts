import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/locale/i18n.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { NewSaleModalService } from '../operations/new-sale-modal.service';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { summarizeTransactionsByPeriod } from '../../shared/stats/transaction-period-stats';
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { MbTablePaginatorComponent } from '../../shared/ui/mb-table-paginator.component';
import { formatUsd } from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-accountant-desk-page',
  imports: [
    RouterLink,
    MbCardComponent,
    MbButtonComponent,
    MbBadgeComponent,
    MbQuickStatsRowComponent,
    MbQuickStatTileComponent,
    MbTablePaginatorComponent,
  ],
  template: `
    <div class="mx-auto max-w-4xl space-y-6 md:space-y-8 lg:space-y-10">
      <div
        class="rounded-2xl border border-mb-border bg-[var(--mb-primary-soft)] px-5 py-4 ring-1 ring-inset ring-[color-mix(in_srgb,var(--mb-primary)_15%,transparent)]"
      >
        <div class="flex flex-wrap items-center gap-2">
          <mb-badge tone="success">{{ i18n.t('page.accountant.roleBadge') }}</mb-badge>
          @for (b of branches(); track b.id) {
            <mb-badge tone="neutral">{{ b.name }}</mb-badge>
          }
        </div>
        <p class="mt-2 text-sm font-normal text-mb-text-secondary">
          {{ i18n.t('page.accountant.heroLine') }}
        </p>
      </div>

      <div class="mb-page-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">{{ i18n.t('page.accountant.title') }}</h1>
          <p class="mb-page-sub">{{ i18n.t('page.accountant.subtitle') }}</p>
        </div>
        <mb-btn (click)="saleModal.openModal()">{{ i18n.t('shell.newSale') }}</mb-btn>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile
          variant="violet"
          [label]="i18n.t('page.transactions.statToday')"
          [value]="'' + txStats().todayCount"
          [hint]="formatUsd(txStats().todayRevenue)"
        />
        <mb-quick-stat-tile
          variant="emerald"
          [label]="i18n.t('page.transactions.statThisWeek')"
          [value]="'' + txStats().weekCount"
          [hint]="formatUsd(txStats().weekRevenue)"
        />
        <mb-quick-stat-tile
          variant="amber"
          [label]="i18n.t('page.transactions.statThisMonth')"
          [value]="'' + txStats().monthCount"
          [hint]="formatUsd(txStats().monthRevenue)"
        />
        <mb-quick-stat-tile
          variant="sky"
          [label]="i18n.t('page.accountant.statAllTime')"
          [value]="'' + scopedCount()"
          [hint]="formatUsd(scopedRevenue())"
        />
      </mb-quick-stats-row>

      <mb-card [title]="i18n.t('page.accountant.branchesCardTitle')" [subtitle]="i18n.t('page.accountant.branchesCardSub')">
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{ branchSummary() }}
        </p>
      </mb-card>

      <mb-card [title]="i18n.t('page.accountant.recentSalesTitle')" [subtitle]="i18n.t('page.accountant.recentSalesSub')" [padding]="false">
        @if (scopedSorted().length === 0) {
          <p class="p-6 py-10 text-center text-sm text-slate-500">{{ i18n.t('page.accountant.emptyScoped') }}</p>
        } @else {
          <ul class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (t of pagedSales(); track t.id) {
              <li class="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div class="min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white">{{ t.customerNameSnapshot }}</p>
                  <p class="text-xs text-slate-500">
                    {{ t.branch.code }} · {{ i18n.formatDateTime(t.paymentDate) }}
                  </p>
                </div>
                <p class="shrink-0 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {{ formatUsd(t.totalAmount) }}
                </p>
              </li>
            }
          </ul>
          <mb-table-paginator
            [total]="scopedSorted().length"
            [page]="pageIndex()"
            [pageSize]="pageSize()"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (pageChange)="pageIndex.set($event)"
            (pageSizeChange)="onPageSizeChange($event)"
          />
          <div class="border-t border-slate-100 px-4 py-4 dark:border-slate-800">
            <a
              routerLink="/transactions"
              class="text-sm font-medium text-emerald-700 hover:text-emerald-600 dark:text-emerald-400"
            >
              {{ i18n.t('page.accountant.openFullList') }}
            </a>
          </div>
        }
      </mb-card>
    </div>
  `,
})
export class AccountantDeskPageComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly db = inject(MockDatabaseService);
  readonly saleModal = inject(NewSaleModalService);

  readonly formatUsd = formatUsd;

  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);

  readonly branches = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.db.listBranchesVisibleTo(u) : [];
  });

  readonly branchSummary = computed(() => {
    const names = this.branches().map((b) => b.name);
    return names.length ? names.join(' · ') : '—';
  });

  readonly scopedRevenue = computed(() => {
    const u = this.auth.currentUser();
    if (!u) {
      return 0;
    }
    return this.db
      .listTransactionsFiltered(u)
      .reduce((s, t) => s + t.totalAmount, 0);
  });

  readonly scopedCount = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.db.listTransactionsFiltered(u).length : 0;
  });

  readonly scopedSorted = computed(() => {
    const u = this.auth.currentUser();
    if (!u) {
      return [];
    }
    return [...this.db.listTransactionsFiltered(u)].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    );
  });

  readonly txStats = computed(() => summarizeTransactionsByPeriod(this.scopedSorted()));

  readonly pagedSales = computed(() => {
    const rows = this.scopedSorted();
    const start = this.pageIndex() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.scopedSorted().length;
      this.pageSize();
      untracked(() => {
        const total = this.scopedSorted().length;
        const ps = this.pageSize();
        const max = Math.max(0, Math.ceil(total / ps) - 1);
        if (this.pageIndex() > max) {
          this.pageIndex.set(max);
        }
      });
    });
  }

  onPageSizeChange(n: number): void {
    this.pageSize.set(n);
    this.pageIndex.set(0);
  }
}
