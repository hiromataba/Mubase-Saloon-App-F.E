import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/locale/i18n.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { MbLineChartComponent } from '../../shared/charts/mb-line-chart.component';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { MbStatCardComponent } from '../../shared/ui/mb-stat-card.component';
import { summarizeTransactionsByPeriod } from '../../shared/stats/transaction-period-stats';
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { MbTablePaginatorComponent } from '../../shared/ui/mb-table-paginator.component';
import { MbAvatarComponent } from '../../shared/ui/mb-avatar.component';
import { formatUsd } from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-my-desk-page',
  imports: [
    MbStatCardComponent,
    MbBadgeComponent,
    MbCardComponent,
    MbButtonComponent,
    MbLineChartComponent,
    MbQuickStatsRowComponent,
    MbQuickStatTileComponent,
    MbTablePaginatorComponent,
    MbAvatarComponent,
  ],
  template: `
    @if (!auth.currentUser()?.barberProfileId) {
      <mb-card [title]="i18n.t('page.myDesk.notBarberTitle')">
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{ i18n.t('page.myDesk.notBarberBody') }}
        </p>
        <mb-btn class="mt-4" variant="secondary" (click)="go('/dashboard')">{{ i18n.t('common.back') }}</mb-btn>
      </mb-card>
    } @else {
      <div class="mx-auto max-w-5xl space-y-6 md:space-y-8 lg:space-y-10">
        <div class="mb-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:gap-8">
          <div>
            <h1 class="mb-page-title">{{ i18n.t('page.myDesk.title') }}</h1>
            <p class="mb-page-sub">{{ i18n.t('page.myDesk.subtitle') }}</p>
          </div>
          <mb-btn variant="secondary" (click)="go('/transactions')">{{ i18n.t('page.myDesk.historyCta') }}</mb-btn>
        </div>

        <div class="mb-page-stats-lead grid gap-6 sm:grid-cols-3 lg:gap-8">
          <mb-stat-card
            icon="revenue"
            [label]="i18n.t('page.myDesk.statYourEarnings')"
            [value]="formatUsd(dash().summary.yourEarnings)"
            [trend]="barberCutTrend()"
          />
          <mb-stat-card
            icon="wallet"
            [label]="i18n.t('page.myDesk.statGrossServices')"
            [value]="formatUsd(dash().summary.grossServiceTotal)"
          />
          <mb-stat-card
            icon="activity"
            [label]="i18n.t('page.myDesk.statCompleted')"
            [value]="'' + dash().summary.servicesCount"
            [hint]="i18n.t('page.myDesk.statCompletedHint')"
          />
        </div>

        <mb-card [title]="i18n.t('page.myDesk.earnTrendTitle')" [subtitle]="i18n.t('page.myDesk.earnTrendSub')">
          <mb-line-chart
            [labels]="trend().labels"
            [values]="trend().values"
            [label]="i18n.t('page.myDesk.chartYourEarnings')"
          />
        </mb-card>

        <mb-quick-stats-row>
          <mb-quick-stat-tile
            variant="violet"
            [label]="i18n.t('page.myDesk.todaySales')"
            [value]="'' + txStats().todayCount"
            [hint]="formatUsd(txStats().todayRevenue) + i18n.t('page.myDesk.hintGrossSuffix')"
          />
          <mb-quick-stat-tile
            variant="emerald"
            [label]="i18n.t('page.myDesk.thisWeek')"
            [value]="'' + txStats().weekCount"
            [hint]="formatUsd(txStats().weekRevenue)"
          />
          <mb-quick-stat-tile
            variant="amber"
            [label]="i18n.t('page.myDesk.thisMonth')"
            [value]="'' + txStats().monthCount"
            [hint]="formatUsd(txStats().monthRevenue)"
          />
          <mb-quick-stat-tile
            variant="sky"
            [label]="i18n.t('page.myDesk.yourCutMonth')"
            [value]="formatUsd(monthBarberCut())"
          />
        </mb-quick-stats-row>

        <mb-card [title]="i18n.t('page.myDesk.recentCutsTitle')" [subtitle]="i18n.t('page.myDesk.recentCutsSub')" [padding]="false">
          @if (dash().recent.length === 0) {
            <p class="p-6 py-8 text-center text-sm text-slate-500">{{ i18n.t('page.myDesk.emptyServices') }}</p>
          } @else {
            <div class="mb-table-wrap hidden lg:block">
              <table class="w-full min-w-[600px]">
                <thead>
                  <tr class="mb-table-head">
                    <th>{{ i18n.t('page.myDesk.thDate') }}</th>
                    <th>{{ i18n.t('page.myDesk.thBranch') }}</th>
                    <th>{{ i18n.t('page.myDesk.thCustomer') }}</th>
                    <th>{{ i18n.t('page.myDesk.thService') }}</th>
                    <th class="text-right">{{ i18n.t('page.myDesk.thYouEarned') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of pagedRecent(); track t.id) {
                    <tr class="mb-table-row">
                      <td class="mb-table-cell text-xs text-slate-500 dark:text-slate-400">
                        {{ i18n.formatDateTime(t.paymentDate) }}
                      </td>
                      <td class="mb-table-cell">
                        <mb-badge tone="neutral" [caps]="false">{{ t.branch.code }}</mb-badge>
                      </td>
                      <td class="mb-table-cell">
                        <div class="flex items-center gap-3">
                          <mb-avatar
                            [label]="t.customerNameSnapshot"
                            [photoUrl]="db.resolveCustomerSnapshotPhotoUrl(t.customerId, t.customerNameSnapshot)"
                            size="sm"
                          />
                          <span class="font-semibold text-slate-900 dark:text-slate-100">{{
                            t.customerNameSnapshot
                          }}</span>
                        </div>
                      </td>
                      <td class="mb-table-cell text-slate-600 dark:text-slate-400">{{ t.serviceNameSnapshot }}</td>
                      <td
                        class="mb-table-cell text-right text-base font-semibold tabular-nums text-slate-900 dark:text-white"
                      >
                        {{ formatUsd(t.barberEarning) }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="space-y-3 p-4 lg:hidden">
              @for (t of pagedRecent(); track t.id) {
                <div
                  class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="font-medium text-slate-900 dark:text-white">{{ t.customerNameSnapshot }}</p>
                      <p class="truncate text-xs text-slate-500">{{ t.serviceNameSnapshot }}</p>
                    </div>
                    <p class="shrink-0 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {{ formatUsd(t.barberEarning) }}
                    </p>
                  </div>
                  <p class="mt-2 text-xs text-slate-500">{{ i18n.formatDateTime(t.paymentDate) }} · {{ t.branch.code }}</p>
                </div>
              }
            </div>
            <mb-table-paginator
              [total]="dash().recent.length"
              [page]="pageIndex()"
              [pageSize]="pageSize()"
              (pageChange)="pageIndex.set($event)"
              (pageSizeChange)="onPageSizeChange($event)"
            />
          }
        </mb-card>
      </div>
    }
  `,
})
export class MyDeskPageComponent {
  readonly auth = inject(AuthService);
  readonly db = inject(MockDatabaseService);
  readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  readonly formatUsd = formatUsd;

  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);

  readonly dash = computed(() => {
    const id = this.auth.currentUser()?.barberProfileId;
    if (!id) {
      return {
        summary: { servicesCount: 0, grossServiceTotal: 0, yourEarnings: 0 },
        recent: [],
      };
    }
    return this.db.getBarberDashboard(id);
  });

  readonly trend = computed(() => {
    const id = this.auth.currentUser()?.barberProfileId;
    if (!id) {
      return { labels: [] as string[], values: [] as number[] };
    }
    return this.db.barberPersonalRevenueOverDays(id, 14);
  });

  readonly barberCutTrend = computed((): { text: string; up: boolean; hint?: string } | null => {
    const vals = this.trend().values;
    if (vals.length < 8) {
      return null;
    }
    const recent = vals.slice(-7).reduce((s, v) => s + v, 0);
    const prior = vals.slice(0, 7).reduce((s, v) => s + v, 0);
    if (prior <= 0) {
      return null;
    }
    const raw = ((recent - prior) / prior) * 100;
    const pct = Math.min(999, Math.max(-999, Math.round(raw)));
    return {
      text: `${Math.abs(pct)}%`,
      up: pct >= 0,
      hint: this.i18n.t('page.myDesk.trendVsWeek'),
    };
  });

  readonly txStats = computed(() => summarizeTransactionsByPeriod(this.dash().recent));

  readonly monthBarberCut = computed(() => {
    const now = new Date();
    const m0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let sum = 0;
    for (const t of this.dash().recent) {
      const time = new Date(t.paymentDate).getTime();
      if (!Number.isNaN(time) && time >= m0) {
        sum += t.barberEarning;
      }
    }
    return sum;
  });

  readonly pagedRecent = computed(() => {
    const rows = this.dash().recent;
    const start = this.pageIndex() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.dash().recent.length;
      this.pageSize();
      untracked(() => {
        const total = this.dash().recent.length;
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

  go(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
