import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/locale/i18n.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { NewSaleModalService } from '../operations/new-sale-modal.service';
import { MbBarChartComponent } from '../../shared/charts/mb-bar-chart.component';
import { MbDonutChartComponent } from '../../shared/charts/mb-donut-chart.component';
import { MbLineChartComponent } from '../../shared/charts/mb-line-chart.component';
import { MbAvatarComponent } from '../../shared/ui/mb-avatar.component';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { MbStatCardComponent } from '../../shared/ui/mb-stat-card.component';
import { summarizeTransactionsByPeriod } from '../../shared/stats/transaction-period-stats';
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { MbTablePaginatorComponent } from '../../shared/ui/mb-table-paginator.component';
import { formatUsd } from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [
    MbStatCardComponent,
    MbCardComponent,
    MbButtonComponent,
    MbBadgeComponent,
    MbLineChartComponent,
    MbBarChartComponent,
    MbDonutChartComponent,
    MbAvatarComponent,
    MbQuickStatsRowComponent,
    MbQuickStatTileComponent,
    MbTablePaginatorComponent,
  ],
  template: `
    <div class="mx-auto w-full min-w-0 max-w-7xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">
            {{ auth.canViewOwnerDashboard() ? i18n.t('dash.title.owner') : i18n.t('dash.title.manager') }}
          </h1>
          <p class="mb-page-sub">
            @if (auth.canViewOwnerDashboard()) {
              {{ i18n.t('dash.subtitle.owner') }}
            } @else {
              {{ i18n.t('dash.subtitle.manager') }}
            }
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          @if (auth.canOperateFrontDesk()) {
            <mb-btn variant="secondary" (click)="saleModal.openModal()">{{ i18n.t('shell.newSale') }}</mb-btn>
          }
          <mb-btn (click)="go('/transactions')">{{ i18n.t('nav.transactions') }}</mb-btn>
          @if (auth.canViewOwnerDashboard()) {
            <mb-btn variant="secondary" (click)="go('/staff')">{{ i18n.t('nav.staff') }}</mb-btn>
          }
        </div>
      </div>

      <div class="mb-page-stats-lead grid gap-6 sm:grid-cols-2 xl:grid-cols-4 lg:gap-8">
        <mb-stat-card
          icon="revenue"
          [label]="i18n.t('dash.stats.grossRevenue')"
          [value]="formatUsd(ownerView().totals.revenue)"
          [trend]="revenueStatTrend()"
        />
        <mb-stat-card
          icon="wallet"
          [label]="i18n.t('dash.stats.shopShare')"
          [value]="formatUsd(ownerView().totals.shopEarnings)"
          [hint]="i18n.t('dash.stats.shopShareHint')"
        />
        <mb-stat-card
          icon="team"
          [label]="i18n.t('dash.stats.barberPayouts')"
          [value]="formatUsd(ownerView().totals.barberEarnings)"
        />
        <mb-stat-card
          icon="activity"
          [label]="i18n.t('nav.transactions')"
          [value]="'' + ownerView().totals.transactionCount"
          [hint]="i18n.t('dash.stats.transactionsHint')"
        />
      </div>

      <div class="grid gap-8 xl:grid-cols-2 xl:gap-10">
        <mb-card [title]="i18n.t('dash.card.revTrend.title')" [subtitle]="i18n.t('dash.card.revTrend.subtitle')">
          <mb-line-chart
            [labels]="rev().labels"
            [values]="rev().values"
            [label]="i18n.t('dash.chart.revLabel')"
          />
        </mb-card>
        <mb-card [title]="i18n.t('dash.card.serviceMix.title')" [subtitle]="i18n.t('dash.card.serviceMix.subtitle')">
          <mb-donut-chart [labels]="mix().labels" [values]="mix().values" />
        </mb-card>
        <mb-card [title]="i18n.t('dash.card.branchPerf.title')" [subtitle]="i18n.t('dash.card.branchPerf.subtitle')">
          <mb-bar-chart [labels]="brChart().labels" [values]="brChart().values" />
        </mb-card>
        <mb-card [title]="i18n.t('dash.card.barberEarn.title')" [subtitle]="i18n.t('dash.card.barberEarn.subtitle')">
          <mb-bar-chart [labels]="barberChart().labels" [values]="barberChart().values" />
        </mb-card>
      </div>

      <div class="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
        <div class="min-w-0 max-w-full">
        <mb-card [title]="i18n.t('dash.card.branchTable.title')" [subtitle]="i18n.t('dash.card.branchTable.subtitle')" [padding]="false">
          <div class="max-w-full overflow-x-auto border-b border-mb-border p-4 lg:p-6 [-webkit-overflow-scrolling:touch]">
            <mb-quick-stats-row>
              <mb-quick-stat-tile variant="violet" [label]="i18n.t('dash.stat.locations')" [value]="'' + branchTableStats().count" />
              <mb-quick-stat-tile
                variant="emerald"
                [label]="i18n.t('dash.stats.grossRevenue')"
                [value]="formatUsd(branchTableStats().revenue)"
              />
              <mb-quick-stat-tile variant="amber" [label]="i18n.t('dash.stats.shopShare')" [value]="formatUsd(branchTableStats().shop)" />
              <mb-quick-stat-tile variant="sky" [label]="i18n.t('nav.transactions')" [value]="'' + branchTableStats().tx" />
            </mb-quick-stats-row>
          </div>
          <div class="mb-table-wrap hidden lg:block">
            <table class="w-full min-w-[420px]">
              <thead>
                <tr class="mb-table-head">
                  <th>{{ i18n.t('dash.branchTh.branch') }}</th>
                  <th class="text-right">{{ i18n.t('dash.branchTh.revenue') }}</th>
                  <th class="text-right">{{ i18n.t('dash.branchTh.shop') }}</th>
                  <th class="text-right">{{ i18n.t('dash.branchTh.tx') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (row of branchPaged(); track row.branch.id) {
                  <tr class="mb-table-row">
                    <td class="mb-table-cell">
                      <div class="flex items-center gap-2">
                        <mb-badge tone="neutral" [caps]="false">{{ row.branch.code }}</mb-badge>
                        <span class="font-semibold text-slate-900 dark:text-slate-100">{{ row.branch.name }}</span>
                      </div>
                    </td>
                    <td class="mb-table-cell text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {{ formatUsd(row.revenue) }}
                    </td>
                    <td class="mb-table-cell text-right tabular-nums text-slate-900 dark:text-white">
                      {{ formatUsd(row.shopEarnings) }}
                    </td>
                    <td class="mb-table-cell text-right tabular-nums font-medium">{{ row.transactionCount }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="max-w-full space-y-3 overflow-hidden p-4 sm:p-5 lg:hidden">
            @for (row of branchPaged(); track row.branch.id) {
              <div
                class="max-w-full rounded-2xl border border-mb-border bg-mb-surface p-4 shadow-mb-card dark:shadow-mb-card-dark"
              >
                <div class="flex items-start justify-between gap-3">
                  <p class="min-w-0 flex-1 break-words font-semibold text-mb-text-primary">{{ row.branch.name }}</p>
                  <mb-badge tone="info" [caps]="false">{{ row.branch.code }}</mb-badge>
                </div>
                <dl class="mt-4 space-y-2.5 text-sm">
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="shrink-0 text-mb-text-secondary">{{ i18n.t('dash.branchMobile.rev') }}</dt>
                    <dd class="text-right font-semibold tabular-nums text-mb-text-primary">{{ formatUsd(row.revenue) }}</dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="shrink-0 text-mb-text-secondary">{{ i18n.t('dash.branchMobile.shop') }}</dt>
                    <dd class="text-right font-semibold tabular-nums text-mb-primary">{{ formatUsd(row.shopEarnings) }}</dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-3">
                    <dt class="shrink-0 text-mb-text-secondary">{{ i18n.t('dash.branchMobile.tx') }}</dt>
                    <dd class="text-right font-semibold tabular-nums text-mb-text-primary">{{ row.transactionCount }}</dd>
                  </div>
                </dl>
              </div>
            }
          </div>
          <mb-table-paginator
            [total]="ownerView().byBranch.length"
            [page]="branchPageIndex()"
            [pageSize]="branchPageSize()"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (pageChange)="branchPageIndex.set($event)"
            (pageSizeChange)="onBranchPageSize($event)"
          />
        </mb-card>
        </div>

        <div class="min-w-0 max-w-full">
        <mb-card [title]="i18n.t('dash.topBarbers.title')" [subtitle]="i18n.t('dash.topBarbers.subtitle')">
          <ul class="min-w-0 max-w-full list-none space-y-3 p-0">
            @for (row of ownerView().byBarber.slice(0, 5); track row.barber.id) {
              <li
                class="min-w-0 max-w-full rounded-2xl border border-mb-border bg-mb-surface p-4 shadow-sm transition hover:border-mb-border hover:shadow-mb-card sm:p-3 dark:bg-mb-surface dark:shadow-none dark:hover:shadow-mb-card-dark md:flex md:items-center md:justify-between md:gap-4 md:rounded-xl md:border-mb-border md:px-4 md:py-3 md:shadow-none"
              >
                <div class="flex min-w-0 max-w-full items-center gap-3">
                  <mb-avatar
                    [label]="row.barber.displayName"
                    [photoUrl]="db.resolveBarberProfilePhotoUrl(row.barber.id)"
                    size="sm"
                  />
                  <div class="min-w-0 flex-1 overflow-hidden">
                    <p class="truncate font-semibold leading-snug text-mb-text-primary">{{ row.barber.displayName }}</p>
                    <p class="mt-0.5 truncate text-xs text-mb-text-secondary">{{ row.branch.name }}</p>
                  </div>
                </div>
                <div
                  class="mt-3 flex min-w-0 max-w-full flex-wrap items-center justify-between gap-2 border-t border-mb-border pt-3 sm:mt-4 md:mt-0 md:w-auto md:shrink-0 md:flex-col md:items-end md:border-0 md:pt-0 md:text-right"
                >
                  <mb-badge tone="neutral" [caps]="false"
                    >{{ row.servicesCount }} {{ i18n.t('dash.servicesCountCuts') }}</mb-badge
                  >
                  <p
                    class="min-w-0 max-w-full truncate text-right text-base font-semibold tabular-nums text-mb-text-primary md:max-w-none md:shrink-0 md:text-sm lg:text-base"
                  >
                    {{ formatUsd(row.revenue) }}
                  </p>
                </div>
              </li>
            }
          </ul>
        </mb-card>
        </div>
      </div>

      @if (auth.isManagerWorkspace()) {
        <mb-card [title]="i18n.t('dash.staff.cardTitle')" [subtitle]="i18n.t('dash.staff.cardSubtitle')" [padding]="false">
          @if (managerStaff().length === 0) {
            <p class="p-6 text-sm text-slate-500">{{ i18n.t('dash.staff.empty') }}</p>
          } @else {
            <div class="border-b border-slate-100 p-4 dark:border-slate-800 lg:p-6">
              <mb-quick-stats-row>
                <mb-quick-stat-tile variant="violet" [label]="i18n.t('dash.staff.qPeople')" [value]="'' + managerStaff().length" />
                <mb-quick-stat-tile variant="emerald" [label]="i18n.t('dash.staff.qManagers')" [value]="'' + managerStaffRoleStats().managers" />
                <mb-quick-stat-tile
                  variant="amber"
                  [label]="i18n.t('dash.staff.qAccountants')"
                  [value]="'' + managerStaffRoleStats().accountants"
                />
                <mb-quick-stat-tile variant="sky" [label]="i18n.t('dash.staff.qReception')" [value]="'' + managerStaffRoleStats().other" />
              </mb-quick-stats-row>
            </div>
            <div class="mb-table-wrap hidden md:block">
              <table class="w-full min-w-[560px]">
                <thead>
                  <tr class="mb-table-head">
                    <th>{{ i18n.t('dash.staff.thName') }}</th>
                    <th>{{ i18n.t('dash.staff.thEmail') }}</th>
                    <th>{{ i18n.t('dash.staff.thBranch') }}</th>
                    <th>{{ i18n.t('dash.staff.thRole') }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of managerStaffPaged(); track row.id) {
                    <tr class="mb-table-row">
                      <td class="mb-table-cell">
                        <div class="flex items-center gap-3">
                          <mb-avatar [label]="row.fullName" [photoUrl]="row.photoUrl" size="sm" />
                          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ row.fullName }}</span>
                        </div>
                      </td>
                      <td class="mb-table-cell text-sm text-slate-600 dark:text-slate-400">{{ row.email }}</td>
                      <td class="mb-table-cell">
                        <mb-badge tone="neutral" [caps]="false">{{ row.branchName }}</mb-badge>
                      </td>
                      <td class="mb-table-cell">
                        <mb-badge tone="neutral" [caps]="false">{{ row.role }}</mb-badge>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <ul class="space-y-3 p-4 md:hidden">
              @for (row of managerStaffPaged(); track row.id) {
                <li
                  class="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
                >
                  <p class="font-medium text-slate-900 dark:text-white">{{ row.fullName }}</p>
                  <p class="text-xs text-slate-500">{{ row.email }}</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <mb-badge tone="info">{{ row.branchName }}</mb-badge>
                    <mb-badge tone="neutral">{{ row.role }}</mb-badge>
                  </div>
                </li>
              }
            </ul>
            <mb-table-paginator
              [total]="managerStaff().length"
              [page]="staffPageIndex()"
              [pageSize]="staffPageSize()"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (pageChange)="staffPageIndex.set($event)"
              (pageSizeChange)="onStaffPageSize($event)"
            />
          }
        </mb-card>
      }

      <mb-card [title]="i18n.t('dash.activity.title')" [subtitle]="i18n.t('dash.activity.subtitle')" [padding]="false">
        @if (pulseSorted().length === 0) {
          <p class="p-6 py-8 text-center text-sm text-mb-text-secondary">{{ i18n.t('dash.activity.empty') }}</p>
        } @else {
          <div class="border-b border-mb-border p-4 lg:p-6">
            <mb-quick-stats-row>
              <mb-quick-stat-tile variant="violet" [label]="i18n.t('dash.activity.qSales7')" [value]="'' + pulseSorted().length" />
              <mb-quick-stat-tile
                variant="emerald"
                [label]="i18n.t('dash.activity.qVolume')"
                [value]="formatUsd(pulseVolume())"
              />
              <mb-quick-stat-tile
                variant="amber"
                [label]="i18n.t('dash.activity.qAvgTicket')"
                [value]="formatUsd(pulseAvgTicket())"
              />
              <mb-quick-stat-tile variant="sky" [label]="i18n.t('dash.activity.qToday')" [value]="'' + pulsePeriodStats().todayCount" />
            </mb-quick-stats-row>
          </div>
          <div class="mb-table-wrap hidden lg:block">
            <table class="w-full min-w-[720px]">
              <thead>
                <tr class="mb-table-head">
                  <th>{{ i18n.t('dash.activity.thWhen') }}</th>
                  <th>{{ i18n.t('dash.activity.thBranch') }}</th>
                  <th>{{ i18n.t('dash.activity.thCustomer') }}</th>
                  <th>{{ i18n.t('dash.activity.thBarber') }}</th>
                  <th class="text-right">{{ i18n.t('dash.activity.thTotal') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (t of pulsePaged(); track t.id) {
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
                        <span class="font-semibold text-slate-900 dark:text-slate-100">{{ t.customerNameSnapshot }}</span>
                      </div>
                    </td>
                    <td class="mb-table-cell">
                      <div class="flex items-center gap-3">
                        <mb-avatar
                          [label]="t.barber.displayName"
                          [photoUrl]="db.resolveBarberProfilePhotoUrl(t.barber.id)"
                          size="sm"
                        />
                        <span class="font-medium text-slate-800 dark:text-slate-200">{{ t.barber.displayName }}</span>
                      </div>
                    </td>
                    <td class="mb-table-cell text-right text-base font-semibold tabular-nums text-slate-900 dark:text-white">
                      {{ formatUsd(t.totalAmount) }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="space-y-3 p-4 sm:p-5 lg:hidden">
            @for (t of pulsePaged(); track t.id) {
              <div
                class="rounded-2xl border border-mb-border bg-mb-surface p-4 shadow-mb-card dark:shadow-mb-card-dark"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-3">
                      <mb-avatar
                        [label]="t.customerNameSnapshot"
                        [photoUrl]="db.resolveCustomerSnapshotPhotoUrl(t.customerId, t.customerNameSnapshot)"
                        size="sm"
                      />
                      <p class="min-w-0 break-words font-semibold leading-snug text-mb-text-primary">
                        {{ t.customerNameSnapshot }}
                      </p>
                    </div>
                    <p class="mt-2 text-xs text-mb-text-secondary">{{ i18n.formatDateTime(t.paymentDate) }}</p>
                  </div>
                  <p class="shrink-0 text-base font-semibold tabular-nums text-mb-text-primary">
                    {{ formatUsd(t.totalAmount) }}
                  </p>
                </div>
                <div class="mt-4 border-t border-mb-border pt-3">
                  <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-mb-text-secondary">
                    {{ i18n.t('dash.activity.details') }}
                  </p>
                  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                    <mb-badge tone="neutral" [caps]="false">{{ t.branch.code }}</mb-badge>
                    <div class="flex min-w-0 items-center gap-2">
                      <mb-avatar
                        [label]="t.barber.displayName"
                        [photoUrl]="db.resolveBarberProfilePhotoUrl(t.barber.id)"
                        size="sm"
                      />
                      <span class="truncate text-sm font-medium text-mb-text-primary">{{ t.barber.displayName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
          <mb-table-paginator
            [total]="pulseSorted().length"
            [page]="pulsePageIndex()"
            [pageSize]="pulsePageSize()"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (pageChange)="pulsePageIndex.set($event)"
            (pageSizeChange)="onPulsePageSize($event)"
          />
        }
      </mb-card>
    </div>
  `,
})
export class DashboardPageComponent {
  readonly auth = inject(AuthService);
  readonly db = inject(MockDatabaseService);
  private readonly router = inject(Router);
  readonly saleModal = inject(NewSaleModalService);
  readonly i18n = inject(I18nService);
  readonly formatUsd = formatUsd;

  readonly branchPageIndex = signal(0);
  readonly branchPageSize = signal(5);
  readonly staffPageIndex = signal(0);
  readonly staffPageSize = signal(5);
  readonly pulsePageIndex = signal(0);
  readonly pulsePageSize = signal(5);

  readonly branchScope = computed(() => {
    const u = this.auth.currentUser();
    if (!u || u.isOwner) {
      return undefined;
    }
    return new Set(this.db.listBranchesVisibleTo(u).map((b) => b.id));
  });

  readonly rev = computed(() => this.db.revenueOverDays(14, this.branchScope()));

  /** Derived from the same 14-day revenue series as the chart (presentation only). */
  readonly revenueStatTrend = computed((): { text: string; up: boolean; hint?: string } | null => {
    const vals = this.rev().values;
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
      hint: this.i18n.t('dash.trend.vsPriorWeek'),
    };
  });

  readonly mix = computed(() => this.db.serviceMixChart(this.branchScope()));
  readonly brChart = computed(() => this.db.branchPerformanceChart(this.branchScope()));
  readonly barberChart = computed(() => this.db.barberEarningsChart(8, this.branchScope()));

  readonly ownerView = computed(() => {
    const u = this.auth.currentUser();
    const full = this.db.getOwnerDashboard();
    if (!u || u.isOwner) {
      return full;
    }
    const allowed = new Set(this.db.listBranchesVisibleTo(u).map((b) => b.id));
    const txs = this.db.transactions().filter((t) => allowed.has(t.branchId));
    const revenue = txs.reduce((s, t) => s + t.totalAmount, 0);
    const barber = txs.reduce((s, t) => s + t.barberEarning, 0);
    const shop = txs.reduce((s, t) => s + t.shopEarning, 0);
    return {
      totals: {
        transactionCount: txs.length,
        revenue,
        barberEarnings: barber,
        shopEarnings: shop,
      },
      byBranch: full.byBranch.filter((r) => allowed.has(r.branch.id)),
      byBarber: full.byBarber.filter((r) => allowed.has(r.branch.id)),
    };
  });

  readonly pulse = computed(() => {
    const u = this.auth.currentUser();
    if (!u) {
      return [];
    }
    return this.db.staffPulse(u);
  });

  readonly pulseSorted = computed(() =>
    [...this.pulse()].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    ),
  );

  readonly pulseVolume = computed(() =>
    this.pulseSorted().reduce((s, t) => s + t.totalAmount, 0),
  );

  readonly pulseAvgTicket = computed(() => {
    const n = this.pulseSorted().length;
    return n ? this.pulseVolume() / n : 0;
  });

  readonly pulsePeriodStats = computed(() => summarizeTransactionsByPeriod(this.pulseSorted()));

  readonly pulsePaged = computed(() => {
    const rows = this.pulseSorted();
    const start = this.pulsePageIndex() * this.pulsePageSize();
    return rows.slice(start, start + this.pulsePageSize());
  });

  readonly branchTableStats = computed(() => {
    const rows = this.ownerView().byBranch;
    let revenue = 0;
    let shop = 0;
    let tx = 0;
    for (const r of rows) {
      revenue += r.revenue;
      shop += r.shopEarnings;
      tx += r.transactionCount;
    }
    return { count: rows.length, revenue, shop, tx };
  });

  readonly branchPaged = computed(() => {
    const rows = this.ownerView().byBranch;
    const start = this.branchPageIndex() * this.branchPageSize();
    return rows.slice(start, start + this.branchPageSize());
  });

  readonly managerStaffRoleStats = computed(() => {
    let managers = 0;
    let accountants = 0;
    let other = 0;
    for (const r of this.managerStaff()) {
      if (r.role === 'MANAGER') {
        managers += 1;
      } else if (r.role === 'ACCOUNTANT') {
        accountants += 1;
      } else {
        other += 1;
      }
    }
    return { managers, accountants, other };
  });

  readonly managerStaffPaged = computed(() => {
    const rows = this.managerStaff();
    const start = this.staffPageIndex() * this.staffPageSize();
    return rows.slice(start, start + this.staffPageSize());
  });

  readonly managerStaff = computed(() => {
    const u = this.auth.currentUser();
    if (!this.auth.isManagerWorkspace() || !u) {
      return [];
    }
    const rows: { id: string; fullName: string; email: string; branchName: string; role: string; photoUrl: string }[] =
      [];
    for (const b of this.db.listBranchesVisibleTo(u)) {
      for (const s of this.db.listStaffForBranch(b.id)) {
        const usr = this.db.getUserById(s.userId);
        if (usr) {
          rows.push({
            id: s.id,
            fullName: usr.fullName,
            email: usr.email,
            branchName: b.name,
            role: s.role,
            photoUrl: this.db.resolveUserPhotoUrl(usr.id),
          });
        }
      }
    }
    return rows;
  });

  constructor() {
    effect(() => {
      this.ownerView().byBranch.length;
      this.branchPageSize();
      untracked(() => {
        const total = this.ownerView().byBranch.length;
        const ps = this.branchPageSize();
        const max = Math.max(0, Math.ceil(total / ps) - 1);
        if (this.branchPageIndex() > max) {
          this.branchPageIndex.set(max);
        }
      });
    });
    effect(() => {
      this.managerStaff().length;
      this.staffPageSize();
      untracked(() => {
        const total = this.managerStaff().length;
        const ps = this.staffPageSize();
        const max = Math.max(0, Math.ceil(total / ps) - 1);
        if (this.staffPageIndex() > max) {
          this.staffPageIndex.set(max);
        }
      });
    });
    effect(() => {
      this.pulseSorted().length;
      this.pulsePageSize();
      untracked(() => {
        const total = this.pulseSorted().length;
        const ps = this.pulsePageSize();
        const max = Math.max(0, Math.ceil(total / ps) - 1);
        if (this.pulsePageIndex() > max) {
          this.pulsePageIndex.set(max);
        }
      });
    });
  }

  onBranchPageSize(n: number): void {
    this.branchPageSize.set(n);
    this.branchPageIndex.set(0);
  }

  onStaffPageSize(n: number): void {
    this.staffPageSize.set(n);
    this.staffPageIndex.set(0);
  }

  onPulsePageSize(n: number): void {
    this.pulsePageSize.set(n);
    this.pulsePageIndex.set(0);
  }

  go(path: string): void {
    void this.router.navigateByUrl(path);
  }
}
