import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import type { Branch, Customer, TransactionListItem } from '../../data/models/domain.types';
import { I18nService } from '../../core/locale/i18n.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { MbActionMenuComponent, type MbActionMenuItem } from '../../shared/ui/mb-action-menu.component';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { MbConfirmDialogComponent } from '../../shared/ui/mb-confirm-dialog.component';
import { MbFieldComponent } from '../../shared/ui/mb-field.component';
import { MbModalComponent } from '../../shared/ui/mb-modal.component';
import { MbPhoneInputComponent } from '../../shared/ui/mb-phone-input.component';
import { MbAvatarComponent } from '../../shared/ui/mb-avatar.component';
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { MbTablePaginatorComponent } from '../../shared/ui/mb-table-paginator.component';
import { formatDateTime, formatUsd } from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-customers-page',
  imports: [
    ReactiveFormsModule,
    MbCardComponent,
    MbBadgeComponent,
    MbButtonComponent,
    MbModalComponent,
    MbFieldComponent,
    MbConfirmDialogComponent,
    MbActionMenuComponent,
    MbQuickStatsRowComponent,
    MbQuickStatTileComponent,
    MbTablePaginatorComponent,
    MbAvatarComponent,
    MbPhoneInputComponent,
  ],
  template: `
    <div class="mx-auto max-w-7xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">{{ i18n.t('page.customers.title') }}</h1>
          <p class="mb-page-sub">{{ i18n.t('page.customers.subtitle') }}</p>
        </div>
        <div class="flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-end lg:gap-6">
          <div class="mb-toolbar flex-1 sm:max-w-md">
            <input
              type="search"
              class="mb-input min-w-0 flex-1"
              [attr.placeholder]="i18n.t('page.customers.searchPlaceholder')"
              [value]="query()"
              (input)="onQueryInput($event)"
            />
          </div>
          <mb-btn (click)="openAdd()">{{ i18n.t('page.customers.modalAdd') }}</mb-btn>
        </div>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" [label]="i18n.t('page.customers.statCount')" [value]="'' + customerStats().count" />
        <mb-quick-stat-tile variant="emerald" [label]="i18n.t('page.customers.statVisits')" [value]="'' + customerStats().visits" />
        <mb-quick-stat-tile
          variant="amber"
          [label]="i18n.t('page.customers.statWithWa')"
          [value]="'' + customerStats().withWa"
          [hint]="customerStats().count ? customerStats().withWaPct + '%' : '—'"
        />
        <mb-quick-stat-tile variant="sky" [label]="i18n.t('page.customers.statBranches')" [value]="'' + customerStats().locationsTouched" />
      </mb-quick-stats-row>

      <mb-card [title]="i18n.t('page.customers.dirTitleLead') + ' (' + filtered().length + ')'" [subtitle]="i18n.t('page.customers.dirSubtitle')" [padding]="false">
        <div class="mb-table-wrap hidden lg:block">
          <table class="w-full min-w-[840px]">
            <thead>
              <tr class="mb-table-head">
                <th>{{ i18n.t('page.customers.thCustomer') }}</th>
                <th>{{ i18n.t('page.customers.thBranchesVisited') }}</th>
                <th>{{ i18n.t('page.customers.thWhatsapp') }}</th>
                <th class="text-right">{{ i18n.t('page.customers.thVisits') }}</th>
                <th>{{ i18n.t('page.customers.thLastVisit') }}</th>
                <th class="w-14"></th>
              </tr>
            </thead>
            <tbody>
              @for (row of paged(); track row.customer.id) {
                <tr class="mb-table-row">
                  <td class="mb-table-cell">
                    <div class="flex items-center gap-3">
                      <mb-avatar
                        [label]="row.customer.fullName"
                        [photoUrl]="db.resolveCustomerListPhotoUrl(row.customer.id)"
                        size="sm"
                      />
                      <span class="font-semibold text-slate-900 dark:text-slate-100">{{ row.customer.fullName }}</span>
                    </div>
                  </td>
                  <td class="mb-table-cell">
                    @if (row.branchesVisited.length) {
                      <div class="flex flex-wrap gap-1.5">
                        @for (b of row.branchesVisited; track b.id) {
                          <mb-badge tone="neutral" [caps]="false">{{ b.name }}</mb-badge>
                        }
                      </div>
                    } @else {
                      <span class="text-slate-400">{{ i18n.t('page.customers.noVisitsYet') }}</span>
                    }
                  </td>
                  <td class="mb-table-cell text-slate-600 dark:text-slate-400">
                    {{ row.customer.whatsapp || row.customer.phone || '—' }}
                  </td>
                  <td class="mb-table-cell text-right">
                    <button
                      type="button"
                      class="inline-flex rounded-lg transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:ring-2 focus-visible:ring-mb-ring disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-slate-800"
                      [disabled]="row.visits === 0"
                      (click)="openVisitsModal(row)"
                      [attr.aria-label]="i18n.t('page.customers.visitsAriaOpen')"
                    >
                      <mb-badge tone="info" [caps]="false">{{ row.visits }}</mb-badge>
                    </button>
                  </td>
                  <td class="mb-table-cell text-xs text-slate-500 dark:text-slate-400">
                    {{ row.lastVisit ? formatDateTime(row.lastVisit) : '—' }}
                  </td>
                  <td class="mb-table-cell text-right">
                    <mb-action-menu [items]="customerMenuItems()" (picked)="onCustomerMenu(row, $event)" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="space-y-3 p-4 lg:hidden">
          @for (row of paged(); track row.customer.id) {
            <div
              class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ row.customer.fullName }}</p>
                  <div class="mt-1 flex flex-wrap gap-1">
                    @if (row.branchesVisited.length) {
                      @for (b of row.branchesVisited; track b.id) {
                        <mb-badge tone="neutral" [caps]="false">{{ b.name }}</mb-badge>
                      }
                    } @else {
                      <span class="text-xs text-slate-400">{{ i18n.t('page.customers.noVisitsYet') }}</span>
                    }
                  </div>
                </div>
                <mb-action-menu [items]="customerMenuItems()" (picked)="onCustomerMenu(row, $event)" />
              </div>
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {{ row.customer.whatsapp || row.customer.phone || i18n.t('page.customers.mobileNoWa') }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-lg transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:ring-2 disabled:opacity-40 dark:hover:bg-slate-800"
                  [disabled]="row.visits === 0"
                  (click)="openVisitsModal(row)"
                  [attr.aria-label]="i18n.t('page.customers.visitsAriaOpen')"
                >
                  <mb-badge tone="info">{{ row.visits }} {{ i18n.t('page.customers.visitsCount') }}</mb-badge>
                </button>
                @if (row.lastVisit) {
                  <mb-badge tone="neutral">{{ formatDateTime(row.lastVisit) }}</mb-badge>
                }
              </div>
            </div>
          }
          @if (filtered().length === 0) {
            <p class="py-8 text-center text-sm text-slate-500">{{ i18n.t('page.customers.emptyMatch') }}</p>
          }
        </div>

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
      [open]="formOpen()"
      [title]="editingId() ? i18n.t('page.customers.modalEdit') : i18n.t('page.customers.modalAdd')"
      size="lg"
      (backdropClose)="closeForm()"
      (closeClick)="closeForm()"
    >
      <form class="space-y-6" [formGroup]="custForm" (ngSubmit)="saveCustomer()">
        <mb-field [label]="i18n.t('page.customers.fieldFullName')">
          <input class="mb-input" formControlName="fullName" />
        </mb-field>
        <mb-field
          [label]="i18n.t('page.customers.fieldWhatsapp')"
          [hint]="i18n.t('page.customers.fieldWhatsappHint')"
          [optional]="true"
        >
          <mb-phone-input formControlName="whatsapp" />
        </mb-field>
        <mb-field [label]="i18n.t('page.customers.fieldNotes')">
          <textarea class="mb-input min-h-[88px] resize-y" formControlName="notes"></textarea>
        </mb-field>
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="custForm.invalid">{{ i18n.t('common.save') }}</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="closeForm()">{{ i18n.t('common.cancel') }}</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-modal
      [open]="detailOpen()"
      [title]="detailCustomer()?.fullName ?? i18n.t('page.customers.modalDetailFallback')"
      [description]="i18n.t('page.customers.modalDetailDesc')"
      size="md"
      (backdropClose)="detailOpen.set(false)"
      (closeClick)="detailOpen.set(false)"
    >
      @if (detailCustomer(); as c) {
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-slate-500">{{ i18n.t('page.customers.thBranchesVisited') }}</dt>
            <dd class="font-medium">
              @if (detailBranchesVisited().length) {
                <div class="mt-1 flex flex-wrap gap-1.5">
                  @for (b of detailBranchesVisited(); track b.id) {
                    <mb-badge tone="neutral" [caps]="false">{{ b.name }}</mb-badge>
                  }
                </div>
              } @else {
                {{ i18n.t('page.customers.noVisitsYet') }}
              }
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">{{ i18n.t('page.customers.labelWhatsapp') }}</dt>
            <dd class="font-medium">{{ c.whatsapp || c.phone || '—' }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">{{ i18n.t('page.customers.labelNotes') }}</dt>
            <dd class="font-medium">{{ c.notes || '—' }}</dd>
          </div>
        </dl>
      }
    </mb-modal>

    <mb-modal
      [open]="visitsModalOpen()"
      [title]="visitsHeading()"
      [description]="i18n.t('page.customers.visitsModalHint')"
      size="xl"
      (backdropClose)="closeVisitsModal()"
      (closeClick)="closeVisitsModal()"
    >
      @if (customerVisitTransactions().length === 0) {
        <p class="py-10 text-center text-sm text-slate-500">{{ i18n.t('page.customers.noVisitsYet') }}</p>
      } @else {
        <ul class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (t of customerVisitTransactions(); track t.id) {
            <li>
              <button
                type="button"
                class="flex w-full flex-wrap items-center justify-between gap-3 px-2 py-3.5 text-left text-sm transition hover:bg-[var(--mb-hover-row)]"
                (click)="openTransactionLedger(t)"
              >
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-slate-900 dark:text-white">{{ t.serviceNameSnapshot }}</p>
                  <p class="text-xs text-slate-500">
                    {{ formatDateTime(t.paymentDate) }} · {{ t.branch.name }} ·
                    {{ t.receipt?.receiptNumber ?? '—' }}
                  </p>
                </div>
                <span class="shrink-0 font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {{ formatUsd(t.totalAmount) }}
                </span>
              </button>
            </li>
          }
        </ul>
      }
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmDelete()"
      [title]="i18n.t('page.customers.confirmDeleteTitle')"
      [message]="i18n.t('page.customers.confirmDeleteMessage')"
      [confirmLabel]="i18n.t('common.delete')"
      [danger]="true"
      (confirm)="doDelete()"
      (cancel)="confirmDelete.set(false)"
    />
  `,
})
export class CustomersPageComponent {
  readonly db = inject(MockDatabaseService);
  readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly formatDateTime = formatDateTime;
  readonly formatUsd = formatUsd;

  readonly visitsModalOpen = signal(false);
  readonly visitsCustomer = signal<Customer | null>(null);

  readonly customerVisitTransactions = computed(() => {
    const c = this.visitsCustomer();
    return c ? this.db.listTransactionsForCustomer(c.id) : [];
  });

  readonly visitsHeading = computed(() => {
    const c = this.visitsCustomer();
    if (!c) {
      return '';
    }
    return `${c.fullName} · ${this.i18n.t('page.customers.visitsModalTitle')}`;
  });

  readonly query = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);

  readonly rows = computed(() =>
    this.db
      .listCustomers()
      .map((c) => ({
        customer: c,
        branchesVisited: this.db.branchesVisitedByCustomer(c.id),
        visits: this.db.customerVisitCount(c.id),
        lastVisit: this.db.lastVisitForCustomer(c.id),
      }))
      .sort((a, b) => (b.lastVisit ?? '').localeCompare(a.lastVisit ?? '')),
  );

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    let list = this.rows();
    if (q) {
      list = list.filter(
        (r) =>
          r.customer.fullName.toLowerCase().includes(q) ||
          (r.customer.phone ?? '').toLowerCase().includes(q) ||
          (r.customer.whatsapp ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  });

  readonly customerStats = computed(() => {
    const rows = this.filtered();
    let visits = 0;
    let withWa = 0;
    const branches = new Set<string>();
    for (const r of rows) {
      visits += r.visits;
      const wa = (r.customer.whatsapp ?? '').replace(/\D/g, '').length > 0;
      const legacyPhone = (r.customer.phone ?? '').replace(/\D/g, '').length > 0;
      if (wa || legacyPhone) {
        withWa += 1;
      }
      for (const b of r.branchesVisited) {
        branches.add(b.id);
      }
    }
    const n = rows.length;
    const withWaPct = n ? Math.round((withWa / n) * 100) : 0;
    return { count: n, visits, withWa, withWaPct: '' + withWaPct, locationsTouched: branches.size };
  });

  readonly paged = computed(() => {
    const rows = this.filtered();
    const start = this.pageIndex() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  constructor() {
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

  readonly customerMenuItems = computed((): MbActionMenuItem[] => [
    { id: 'view', label: this.i18n.t('actionMenu.viewDetails') },
    { id: 'edit', label: this.i18n.t('actionMenu.edit') },
    { id: 'del', label: this.i18n.t('actionMenu.delete'), danger: true },
  ]);

  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly detailOpen = signal(false);
  readonly detailCustomer = signal<Customer | null>(null);
  readonly detailBranchesVisited = signal<Branch[]>([]);
  readonly confirmDelete = signal(false);
  readonly deleteTarget = signal<string | null>(null);

  readonly custForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    whatsapp: [''],
    notes: [''],
  });

  onQueryInput(ev: Event): void {
    const t = ev.target as HTMLInputElement | null;
    this.query.set(t?.value ?? '');
    this.pageIndex.set(0);
  }

  onPageSizeChange(n: number): void {
    this.pageSize.set(n);
    this.pageIndex.set(0);
  }

  onCustomerMenu(
    row: { customer: Customer; branchesVisited: Branch[]; visits: number; lastVisit: string | null },
    id: string,
  ): void {
    if (id === 'view') {
      this.detailCustomer.set(row.customer);
      this.detailBranchesVisited.set(row.branchesVisited);
      this.detailOpen.set(true);
    }
    if (id === 'edit') {
      this.editingId.set(row.customer.id);
      this.custForm.patchValue({
        fullName: row.customer.fullName,
        whatsapp: row.customer.whatsapp ?? row.customer.phone ?? '',
        notes: row.customer.notes ?? '',
      });
      this.formOpen.set(true);
    }
    if (id === 'del') {
      this.deleteTarget.set(row.customer.id);
      this.confirmDelete.set(true);
    }
  }

  openAdd(): void {
    this.editingId.set(null);
    this.custForm.reset({
      fullName: '',
      whatsapp: '',
      notes: '',
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  saveCustomer(): void {
    if (this.custForm.invalid) {
      return;
    }
    const v = this.custForm.getRawValue();
    const wa = v.whatsapp?.trim() || '';
    const hasWa = wa.replace(/\D/g, '').length > 0;
    if (this.editingId()) {
      this.db.updateCustomer(this.editingId()!, {
        fullName: v.fullName,
        phone: null,
        whatsapp: hasWa ? wa : null,
        notes: v.notes || null,
      });
    } else {
      this.db.createCustomer({
        fullName: v.fullName,
        phone: null,
        whatsapp: hasWa ? wa : null,
        notes: v.notes || null,
      });
    }
    this.closeForm();
  }

  doDelete(): void {
    const id = this.deleteTarget();
    if (id) {
      this.db.deleteCustomer(id);
    }
    this.confirmDelete.set(false);
    this.deleteTarget.set(null);
  }

  openVisitsModal(row: { customer: Customer; visits: number }): void {
    if (row.visits <= 0) {
      return;
    }
    this.visitsCustomer.set(row.customer);
    this.visitsModalOpen.set(true);
  }

  closeVisitsModal(): void {
    this.visitsModalOpen.set(false);
    this.visitsCustomer.set(null);
  }

  openTransactionLedger(t: TransactionListItem): void {
    void this.router.navigate(['/transactions'], { queryParams: { tx: t.id } });
    this.closeVisitsModal();
  }
}
