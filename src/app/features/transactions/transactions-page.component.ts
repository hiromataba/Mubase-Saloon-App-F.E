import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/locale/i18n.service';
import type { TransactionListItem } from '../../data/models/domain.types';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { summarizeTransactionsByPeriod } from '../../shared/stats/transaction-period-stats';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { MbConfirmDialogComponent } from '../../shared/ui/mb-confirm-dialog.component';
import { MbModalComponent } from '../../shared/ui/mb-modal.component';
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { MbSelectComponent } from '../../shared/ui/mb-select.component';
import { MbTablePaginatorComponent } from '../../shared/ui/mb-table-paginator.component';
import { MbAvatarComponent } from '../../shared/ui/mb-avatar.component';
import { MbIconButtonComponent } from '../../shared/ui/mb-icon-button.component';
import {
  formatPct,
  formatUsd,
  paymentMethodBadgeTone,
} from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-transactions-page',
  imports: [
    FormsModule,
    MbCardComponent,
    MbButtonComponent,
    MbBadgeComponent,
    MbModalComponent,
    MbConfirmDialogComponent,
    MbQuickStatsRowComponent,
    MbQuickStatTileComponent,
    MbTablePaginatorComponent,
    MbAvatarComponent,
    MbIconButtonComponent,
    MbSelectComponent,
  ],
  template: `
    <div class="mx-auto max-w-7xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">{{ i18n.t('page.transactions.title') }}</h1>
          <p class="mb-page-sub max-lg:hidden">{{ i18n.t('page.transactions.subtitle') }}</p>
        </div>
        <div class="mb-toolbar flex-1 lg:max-w-3xl lg:justify-end">
          <mb-select
            class="min-w-0 flex-1 sm:max-w-[11rem]"
            [options]="branchFilterOptions()"
            [ngModel]="branchFilter()"
            (ngModelChange)="onBranchFilter($event)"
            [placeholder]="i18n.t('page.transactions.filterAllBranches')"
          />
          <mb-select
            class="min-w-0 flex-1 sm:max-w-[11rem]"
            [options]="barberFilterOptions()"
            [ngModel]="barberFilter()"
            (ngModelChange)="onBarberFilter($event)"
            [placeholder]="i18n.t('page.transactions.filterAllBarbers')"
          />
          <input
            type="search"
            [placeholder]="i18n.t('page.transactions.searchPlaceholder')"
            [ngModel]="query()"
            (ngModelChange)="onQuery($event)"
            class="mb-input min-w-0 flex-1 sm:max-w-xs"
          />
        </div>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile
          variant="violet"
          [label]="i18n.t('page.transactions.statToday')"
          [value]="'' + txStats().todayCount"
          [hint]="formatUsd(txStats().todayRevenue) + i18n.t('page.transactions.hintFilteredListSuffix')"
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
          [label]="i18n.t('page.transactions.statFilteredTotal')"
          [value]="formatUsd(filteredRevenue())"
          [hint]="'' + filtered().length + i18n.t('page.transactions.salesCountSuffix')"
        />
      </mb-quick-stats-row>

      <mb-card [padding]="false">
        <div class="mb-table-wrap hidden lg:block">
          <table class="w-full min-w-[1040px]">
            <thead>
              <tr class="mb-table-head">
                <th>{{ i18n.t('page.transactions.colWhen') }}</th>
                <th>{{ i18n.t('page.transactions.colReceipt') }}</th>
                <th>{{ i18n.t('page.transactions.colBranch') }}</th>
                <th>{{ i18n.t('page.transactions.colCustomer') }}</th>
                <th>{{ i18n.t('page.transactions.colService') }}</th>
                <th>{{ i18n.t('page.transactions.colPay') }}</th>
                <th>{{ i18n.t('page.transactions.colBarber') }}</th>
                <th class="text-right">{{ i18n.t('page.transactions.colTotal') }}</th>
                <th class="w-14"></th>
              </tr>
            </thead>
            <tbody>
              @for (t of paged(); track t.id) {
                <tr class="mb-table-row cursor-pointer" (click)="openDetail(t)">
                  <td class="mb-table-cell whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    {{ i18n.formatDateTime(t.paymentDate) }}
                  </td>
                  <td class="mb-table-cell font-mono text-xs text-slate-500 dark:text-slate-400">
                    {{ t.receipt?.receiptNumber ?? '—' }}
                  </td>
                  <td class="mb-table-cell">
                    <mb-badge tone="neutral" [caps]="false">{{ t.branch.code }}</mb-badge>
                  </td>
                  <td class="mb-table-cell">
                    <span class="font-semibold text-slate-900 dark:text-slate-100">{{ t.customerNameSnapshot }}</span>
                  </td>
                  <td class="mb-table-cell max-w-[10rem] truncate text-slate-600 dark:text-slate-400">
                    {{ t.serviceNameSnapshot }}
                  </td>
                  <td class="mb-table-cell">
                    <mb-badge [tone]="paymentMethodBadgeTone(t.paymentMethod)" [caps]="false">{{
                      i18n.paymentMethodLabel(t.paymentMethod)
                    }}</mb-badge>
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
                  <td class="mb-table-cell text-right">
                    <span class="text-base font-semibold tabular-nums text-slate-900 dark:text-white">{{
                      formatUsd(t.totalAmount)
                    }}</span>
                  </td>
                  <td class="mb-table-cell text-right" (click)="$event.stopPropagation()">
                    <mb-icon-btn [ariaLabel]="i18n.t('page.transactions.viewTxAria')" variant="ghost" (click)="openDetail(t)">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </mb-icon-btn>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="space-y-3 p-4 lg:hidden">
          @for (t of paged(); track t.id) {
            <button
              type="button"
              class="w-full rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900/50"
              (click)="openDetail(t)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p
                    class="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500/90 dark:text-slate-500"
                  >
                    {{ i18n.t('page.transactions.colCustomer') }}
                  </p>
                  <p class="truncate text-[15px] font-semibold leading-snug text-slate-950 dark:text-slate-50">
                    {{ t.customerNameSnapshot }}
                  </p>
                </div>
                <div class="shrink-0 text-right">
                  <p
                    class="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-500/90 dark:text-slate-500"
                  >
                    {{ i18n.t('page.transactions.colTotal') }}
                  </p>
                  <p class="text-base font-bold tabular-nums leading-none text-emerald-700 dark:text-emerald-400">
                    {{ formatUsd(t.totalAmount) }}
                  </p>
                </div>
              </div>

              <div class="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span
                  class="text-[11px] font-medium uppercase tracking-wide text-slate-500/95 dark:text-slate-500"
                  >{{ i18n.t('page.transactions.colWhen') }}</span
                >
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{
                  i18n.formatDateTime(t.paymentDate)
                }}</span>
              </div>

              <div
                class="mt-3 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-slate-100 pt-3 text-xs dark:border-slate-800"
              >
                <div class="flex min-w-0 flex-[1_1_44%] items-center gap-2 sm:flex-initial">
                  <span
                    class="shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500"
                    >{{ i18n.t('page.transactions.colBranch') }}</span
                  >
                  <mb-badge tone="neutral" class="truncate" [caps]="false">{{ t.branch.code }}</mb-badge>
                </div>
                <div class="flex min-w-0 flex-[1_1_44%] items-center gap-2 sm:flex-initial">
                  <span
                    class="shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500"
                    >{{ i18n.t('page.transactions.colPay') }}</span
                  >
                  <mb-badge
                    class="max-w-[min(100%,10rem)] truncate"
                    [tone]="paymentMethodBadgeTone(t.paymentMethod)"
                    [caps]="false"
                    >{{ i18n.paymentMethodLabel(t.paymentMethod) }}</mb-badge
                  >
                </div>
                <div class="flex w-full min-w-0 basis-full items-center gap-2 pt-0.5 sm:basis-auto sm:pt-0">
                  <span
                    class="shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500"
                    >{{ i18n.t('page.transactions.colBarber') }}</span
                  >
                  <span
                    class="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100"
                  >
                    <mb-avatar
                      [label]="t.barber.displayName"
                      [photoUrl]="db.resolveBarberProfilePhotoUrl(t.barber.id)"
                      size="sm"
                    />
                    <span class="truncate">{{ t.barber.displayName }}</span>
                  </span>
                </div>
              </div>

              <div class="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span
                  class="text-[10px] font-medium uppercase tracking-wider text-slate-500/90 dark:text-slate-500"
                  >{{ i18n.t('page.transactions.colReceipt') }}</span
                >
                <span class="font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-100">{{
                  t.receipt?.receiptNumber ?? '—'
                }}</span>
              </div>
            </button>
          }
        </div>

        @if (filtered().length === 0) {
          <p class="px-6 py-12 text-center text-sm text-slate-500">
            {{ i18n.t('page.transactions.emptyFiltered') }}
          </p>
        }

        <mb-table-paginator
          [total]="filtered().length"
          [page]="pageIndex()"
          [pageSize]="pageSize()"
          (pageChange)="pageIndex.set($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        />
      </mb-card>
    </div>

    <mb-modal
      [open]="detailOpen()"
      [title]="selected()?.customerNameSnapshot ?? i18n.t('page.transactions.detailTitleFallback')"
      [description]="i18n.t('page.transactions.modalDescPreview')"
      size="xl"
      [footer]="true"
      (backdropClose)="closeDetail()"
      (closeClick)="closeDetail()"
    >
      @if (selected(); as t) {
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <mb-badge tone="info">{{ t.branch.name }}</mb-badge>
              <mb-badge tone="neutral">{{ i18n.paymentMethodLabel(t.paymentMethod) }}</mb-badge>
              <mb-badge tone="success"
                >{{ formatPct(t.commissionPercentSnapshot) }}{{ i18n.t('page.transactions.barberPctSuffix') }}</mb-badge
              >
            </div>
            <dl class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-slate-500">{{ i18n.t('page.transactions.labelService') }}</dt>
                <dd class="font-medium text-slate-900 dark:text-white">{{ t.serviceNameSnapshot }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">{{ i18n.t('page.transactions.labelBarber') }}</dt>
                <dd class="font-medium text-slate-900 dark:text-white">{{ t.barber.displayName }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">{{ i18n.t('page.transactions.labelPhone') }}</dt>
                <dd class="font-medium">{{ t.customerPhoneSnapshot ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">{{ i18n.t('page.transactions.labelWhatsapp') }}</dt>
                <dd class="font-medium">{{ t.customerWhatsappSnapshot ?? '—' }}</dd>
              </div>
            </dl>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">{{ i18n.t('page.transactions.labelTotal') }}</span>
                <span class="font-semibold tabular-nums">{{ formatUsd(t.totalAmount) }}</span>
              </div>
              <div class="mt-2 flex justify-between text-sm">
                <span class="text-slate-500">{{ i18n.t('page.transactions.labelBarberShare') }}</span>
                <span class="font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                  {{ formatUsd(t.barberEarning) }}
                </span>
              </div>
              <div class="mt-1 flex justify-between text-sm">
                <span class="text-slate-500">{{ i18n.t('page.transactions.labelShopShare') }}</span>
                <span class="font-medium tabular-nums">{{ formatUsd(t.shopEarning) }}</span>
              </div>
            </div>
          </div>

          <div
            id="receipt-preview"
            class="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 shadow-inner dark:border-slate-700 dark:bg-slate-950/50"
          >
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p class="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  {{ i18n.t('page.transactions.receiptHeading') }}
                </p>
                <p class="text-xs text-slate-500">{{ t.receipt?.receiptNumber }}</p>
              </div>
              <mb-badge tone="success">{{ t.branch.code }}</mb-badge>
            </div>
            <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {{ i18n.t('page.transactions.receiptThankYou') }}
              <span class="font-medium text-slate-900 dark:text-white">{{ t.customerNameSnapshot }}</span
              >.
            </p>
            <p class="mt-2 text-xs text-slate-500">{{ i18n.formatDateTime(t.paymentDate) }}</p>
            <ul class="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              <li class="flex justify-between">
                <span>{{ t.serviceNameSnapshot }}</span>
                <span class="tabular-nums">{{ formatUsd(t.totalAmount) }}</span>
              </li>
            </ul>
            <p class="mt-6 text-center text-xs text-slate-400">{{ i18n.t('page.transactions.receiptMockFooter') }}</p>
          </div>
        </div>
      }
      <div class="mb-modal-footer-actions flex flex-wrap justify-end gap-2">
        @if (auth.canManageBusiness()) {
          <mb-btn variant="danger" (click)="askDelete()">{{ i18n.t('page.transactions.deleteMock') }}</mb-btn>
        }
        <mb-btn variant="secondary" (click)="closeDetail()">{{ i18n.t('page.transactions.close') }}</mb-btn>
        <mb-btn (click)="printReceipt()">{{ i18n.t('page.transactions.printReceipt') }}</mb-btn>
      </div>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmDelete()"
      [title]="i18n.t('page.transactions.deleteConfirmTitle')"
      [message]="i18n.t('page.transactions.deleteConfirmMessage')"
      [confirmLabel]="i18n.t('page.transactions.deleteConfirmLabel')"
      [danger]="true"
      (confirm)="confirmDeleteTx()"
      (cancel)="confirmDelete.set(false)"
    />
  `,
})
export class TransactionsPageComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly db = inject(MockDatabaseService);
  private readonly route = inject(ActivatedRoute);

  readonly formatUsd = formatUsd;
  readonly formatPct = formatPct;
  readonly paymentMethodBadgeTone = paymentMethodBadgeTone;

  readonly branchFilter = signal('');
  readonly barberFilter = signal('');
  readonly query = signal('');
  readonly confirmDelete = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);

  readonly branches = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.db.listBranchesVisibleTo(u) : [];
  });

  readonly barberOptions = computed(() => {
    const u = this.auth.currentUser();
    if (!u) {
      return [];
    }
    const allowed = new Set(this.db.listBranchesVisibleTo(u).map((b) => b.id));
    return this.db
      .barbers()
      .filter((b) => allowed.has(b.branchId))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  readonly branchFilterOptions = computed(() => [
    { value: '', label: this.i18n.t('page.transactions.filterAllBranches') },
    ...this.branches().map((b) => ({ value: b.id, label: b.name })),
  ]);

  readonly barberFilterOptions = computed(() => [
    { value: '', label: this.i18n.t('page.transactions.filterAllBarbers') },
    ...this.barberOptions().map((bar) => ({ value: bar.id, label: bar.displayName })),
  ]);

  readonly baseList = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.db.listTransactionsFiltered(u) : [];
  });

  readonly filtered = computed(() => {
    let rows = this.baseList();
    if (this.branchFilter()) {
      rows = rows.filter((t) => t.branchId === this.branchFilter());
    }
    if (this.barberFilter()) {
      rows = rows.filter((t) => t.barberProfileId === this.barberFilter());
    }
    const q = this.query().trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.customerNameSnapshot.toLowerCase().includes(q) ||
          (t.receipt?.receiptNumber.toLowerCase().includes(q) ?? false) ||
          t.serviceNameSnapshot.toLowerCase().includes(q),
      );
    }
    return rows;
  });

  readonly txStats = computed(() => summarizeTransactionsByPeriod(this.filtered()));

  readonly filteredRevenue = computed(() =>
    this.filtered().reduce((s, t) => s + t.totalAmount, 0),
  );

  readonly paged = computed(() => {
    const rows = this.filtered();
    const start = this.pageIndex() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  readonly detailOpen = signal(false);
  readonly selected = signal<TransactionListItem | null>(null);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      this.branchFilter.set(q.get('branch') ?? '');
      this.barberFilter.set(q.get('barber') ?? '');
      this.pageIndex.set(0);
    });

    effect(() => {
      this.filtered();
      this.pageSize();
      untracked(() => {
        const total = this.filtered().length;
        const ps = this.pageSize();
        const max = Math.max(0, Math.ceil(total / ps) - 1);
        if (this.pageIndex() > max) {
          this.pageIndex.set(max);
        }
      });
    });
  }

  onBranchFilter(v: string): void {
    this.branchFilter.set(v);
    this.pageIndex.set(0);
  }

  onBarberFilter(v: string): void {
    this.barberFilter.set(v);
    this.pageIndex.set(0);
  }

  onQuery(v: string): void {
    this.query.set(v);
    this.pageIndex.set(0);
  }

  onPageSizeChange(n: number): void {
    this.pageSize.set(n);
    this.pageIndex.set(0);
  }

  openDetail(t: TransactionListItem): void {
    this.selected.set(t);
    this.detailOpen.set(true);
  }

  closeDetail(): void {
    this.detailOpen.set(false);
  }

  askDelete(): void {
    this.confirmDelete.set(true);
  }

  confirmDeleteTx(): void {
    const t = this.selected();
    if (t && this.auth.canManageBusiness()) {
      this.db.deleteTransaction(t.id);
      this.confirmDelete.set(false);
      this.closeDetail();
    }
  }

  printReceipt(): void {
    window.print();
  }
}
