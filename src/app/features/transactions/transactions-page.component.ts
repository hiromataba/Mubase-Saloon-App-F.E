import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CurrencyService } from '../../core/currency/currency.service';
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
  formatDateTime,
  formatPct,
  paymentMethodBadgeTone,
  paymentMethodLabel,
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
          <h1 class="mb-page-title">Transactions</h1>
          <p class="mb-page-sub max-lg:hidden">Ledger · details and receipt preview</p>
        </div>
        <div class="mb-toolbar flex-1 lg:max-w-3xl lg:justify-end">
          <mb-select
            class="min-w-0 flex-1 sm:max-w-[11rem]"
            [options]="branchFilterOptions()"
            [ngModel]="branchFilter()"
            (ngModelChange)="onBranchFilter($event)"
            placeholder="All branches"
          />
          <mb-select
            class="min-w-0 flex-1 sm:max-w-[11rem]"
            [options]="barberFilterOptions()"
            [ngModel]="barberFilter()"
            (ngModelChange)="onBarberFilter($event)"
            placeholder="All barbers"
          />
          <input
            type="search"
            placeholder="Search customer or receipt…"
            [ngModel]="query()"
            (ngModelChange)="onQuery($event)"
            class="mb-input min-w-0 flex-1 sm:max-w-xs"
          />
        </div>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile
          variant="violet"
          label="Today"
          [value]="'' + txStats().todayCount"
          [hint]="currency.format(txStats().todayRevenue) + ' · filtered list'"
        />
        <mb-quick-stat-tile
          variant="emerald"
          label="This week"
          [value]="'' + txStats().weekCount"
          [hint]="currency.format(txStats().weekRevenue)"
        />
        <mb-quick-stat-tile
          variant="amber"
          label="This month"
          [value]="'' + txStats().monthCount"
          [hint]="currency.format(txStats().monthRevenue)"
        />
        <mb-quick-stat-tile
          variant="sky"
          label="Filtered total"
          [value]="currency.format(filteredRevenue())"
          [hint]="filtered().length + ' sales'"
        />
      </mb-quick-stats-row>

      <mb-card [padding]="false">
        <div class="mb-table-wrap hidden lg:block">
          <table class="w-full min-w-[1040px]">
            <thead>
              <tr class="mb-table-head">
                <th>When</th>
                <th>Receipt</th>
                <th>Branch</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Pay</th>
                <th>Barber</th>
                <th class="text-right">Total</th>
                <th class="w-14"></th>
              </tr>
            </thead>
            <tbody>
              @for (t of paged(); track t.id) {
                <tr class="mb-table-row cursor-pointer" (click)="openDetail(t)">
                  <td class="mb-table-cell whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                    {{ formatDateTime(t.paymentDate) }}
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
                      paymentMethodLabel(t.paymentMethod)
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
                      currency.format(t.totalAmount)
                    }}</span>
                  </td>
                  <td class="mb-table-cell text-right" (click)="$event.stopPropagation()">
                    <mb-icon-btn [ariaLabel]="'View transaction'" variant="ghost" (click)="openDetail(t)">
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
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="truncate font-semibold text-slate-900 dark:text-white">{{ t.customerNameSnapshot }}</p>
                  <p class="text-xs text-slate-500">{{ formatDateTime(t.paymentDate) }}</p>
                </div>
                <p class="shrink-0 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {{ currency.format(t.totalAmount) }}
                </p>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <mb-badge tone="neutral" [caps]="false">{{ t.branch.code }}</mb-badge>
                <mb-badge [tone]="paymentMethodBadgeTone(t.paymentMethod)" [caps]="false">{{
                  paymentMethodLabel(t.paymentMethod)
                }}</mb-badge>
                <span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <mb-avatar
                    [label]="t.barber.displayName"
                    [photoUrl]="db.resolveBarberProfilePhotoUrl(t.barber.id)"
                    size="sm"
                  />
                  {{ t.barber.displayName }}
                </span>
              </div>
              <p class="mt-2 font-mono text-[11px] text-slate-400">{{ t.receipt?.receiptNumber }}</p>
            </button>
          }
        </div>

        @if (filtered().length === 0) {
          <p class="px-6 py-12 text-center text-sm text-slate-500">No transactions match your filters.</p>
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
      [title]="selected()?.customerNameSnapshot ?? 'Transaction'"
      description="Settlement detail · mock receipt preview"
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
              <mb-badge tone="neutral">{{ paymentMethodLabel(t.paymentMethod) }}</mb-badge>
              <mb-badge tone="success">{{ formatPct(t.commissionPercentSnapshot) }} barber</mb-badge>
            </div>
            <dl class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-slate-500">Service</dt>
                <dd class="font-medium text-slate-900 dark:text-white">{{ t.serviceNameSnapshot }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Barber</dt>
                <dd class="font-medium text-slate-900 dark:text-white">{{ t.barber.displayName }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">Phone</dt>
                <dd class="font-medium">{{ t.customerPhoneSnapshot ?? '—' }}</dd>
              </div>
              <div>
                <dt class="text-slate-500">WhatsApp</dt>
                <dd class="font-medium">{{ t.customerWhatsappSnapshot ?? '—' }}</dd>
              </div>
            </dl>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Total</span>
                <span class="font-semibold tabular-nums">{{ currency.format(t.totalAmount) }}</span>
              </div>
              <div class="mt-2 flex justify-between text-sm">
                <span class="text-slate-500">Barber share</span>
                <span class="font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                  {{ currency.format(t.barberEarning) }}
                </span>
              </div>
              <div class="mt-1 flex justify-between text-sm">
                <span class="text-slate-500">Shop share</span>
                <span class="font-medium tabular-nums">{{ currency.format(t.shopEarning) }}</span>
              </div>
            </div>
          </div>

          <div
            id="receipt-preview"
            class="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 shadow-inner dark:border-slate-700 dark:bg-slate-950/50"
          >
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p class="font-display text-lg font-semibold text-slate-900 dark:text-white">Receipt</p>
                <p class="text-xs text-slate-500">{{ t.receipt?.receiptNumber }}</p>
              </div>
              <mb-badge tone="success">{{ t.branch.code }}</mb-badge>
            </div>
            <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Thank you,
              <span class="font-medium text-slate-900 dark:text-white">{{ t.customerNameSnapshot }}</span
              >.
            </p>
            <p class="mt-2 text-xs text-slate-500">{{ formatDateTime(t.paymentDate) }}</p>
            <ul class="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              <li class="flex justify-between">
                <span>{{ t.serviceNameSnapshot }}</span>
                <span class="tabular-nums">{{ currency.format(t.totalAmount) }}</span>
              </li>
            </ul>
            <p class="mt-6 text-center text-xs text-slate-400">Mubase Saloon · mock printable preview</p>
          </div>
        </div>
      }
      <div class="mb-modal-footer-actions flex flex-wrap justify-end gap-2">
        @if (auth.canManageBusiness()) {
          <mb-btn variant="danger" (click)="askDelete()">Delete (mock)</mb-btn>
        }
        <mb-btn variant="secondary" (click)="closeDetail()">Close</mb-btn>
        <mb-btn (click)="printReceipt()">Print receipt</mb-btn>
      </div>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmDelete()"
      title="Delete this transaction?"
      message="Removes the row and receipt from the mock ledger."
      confirmLabel="Delete"
      [danger]="true"
      (confirm)="confirmDeleteTx()"
      (cancel)="confirmDelete.set(false)"
    />
  `,
})
export class TransactionsPageComponent {
  readonly auth = inject(AuthService);
  readonly currency = inject(CurrencyService);
  readonly db = inject(MockDatabaseService);
  private readonly route = inject(ActivatedRoute);
  readonly formatDateTime = formatDateTime;
  readonly formatPct = formatPct;
  readonly paymentMethodLabel = paymentMethodLabel;
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
    { value: '', label: 'All branches' },
    ...this.branches().map((b) => ({ value: b.id, label: b.name })),
  ]);

  readonly barberFilterOptions = computed(() => [
    { value: '', label: 'All barbers' },
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
