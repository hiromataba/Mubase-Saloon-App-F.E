import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Branch, Customer } from '../../data/models/domain.types';
import { AuthService } from '../../core/auth/auth.service';
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
import { MbSelectComponent, type MbSelectOption } from '../../shared/ui/mb-select.component';
import { MbTablePaginatorComponent } from '../../shared/ui/mb-table-paginator.component';
import { formatDateTime } from '../../shared/formatters';

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
    MbSelectComponent,
    MbPhoneInputComponent,
  ],
  template: `
    <div class="mx-auto max-w-7xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">Customers</h1>
          <p class="mb-page-sub">Branch directory · visits from mock transactions</p>
        </div>
        <div class="flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-end lg:gap-6">
          <div class="mb-toolbar flex-1 sm:max-w-md">
            <input
              type="search"
              class="mb-input min-w-0 flex-1"
              placeholder="Search name or phone…"
              [value]="query()"
              (input)="onQueryInput($event)"
            />
          </div>
          <mb-btn (click)="openAdd()">Add customer</mb-btn>
        </div>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" label="Customers" [value]="'' + customerStats().count" />
        <mb-quick-stat-tile variant="emerald" label="Total visits" [value]="'' + customerStats().visits" />
        <mb-quick-stat-tile
          variant="amber"
          label="With WhatsApp"
          [value]="'' + customerStats().withWa"
          [hint]="customerStats().count ? customerStats().withWaPct + '%' : '—'"
        />
        <mb-quick-stat-tile variant="sky" label="Branches" [value]="'' + customerStats().branchCount" />
      </mb-quick-stats-row>

      <mb-card [title]="'Directory (' + filtered().length + ')'" subtitle="Phone · WhatsApp · last visit" [padding]="false">
        <div class="mb-table-wrap hidden lg:block">
          <table class="w-full min-w-[840px]">
            <thead>
              <tr class="mb-table-head">
                <th>Customer</th>
                <th>Branch</th>
                <th>Phone</th>
                <th>WhatsApp</th>
                <th class="text-right">Visits</th>
                <th>Last visit</th>
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
                    <mb-badge tone="neutral" [caps]="false">{{ row.branch.name }}</mb-badge>
                  </td>
                  <td class="mb-table-cell text-slate-600 dark:text-slate-400">
                    {{ row.customer.phone || '—' }}
                  </td>
                  <td class="mb-table-cell text-slate-600 dark:text-slate-400">
                    {{ row.customer.whatsapp || '—' }}
                  </td>
                  <td class="mb-table-cell text-right">
                    <mb-badge tone="info" [caps]="false">{{ row.visits }}</mb-badge>
                  </td>
                  <td class="mb-table-cell text-xs text-slate-500 dark:text-slate-400">
                    {{ row.lastVisit ? formatDateTime(row.lastVisit) : '—' }}
                  </td>
                  <td class="mb-table-cell text-right">
                    <mb-action-menu [items]="customerMenuItems" (picked)="onCustomerMenu(row, $event)" />
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
                  <p class="text-xs text-slate-500">{{ row.branch.name }}</p>
                </div>
                <mb-action-menu [items]="customerMenuItems" (picked)="onCustomerMenu(row, $event)" />
              </div>
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {{ row.customer.phone || 'No phone' }}
                @if (row.customer.whatsapp) {
                  <span class="text-slate-400"> · WA {{ row.customer.whatsapp }}</span>
                }
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <mb-badge tone="info">{{ row.visits }} visits</mb-badge>
                @if (row.lastVisit) {
                  <mb-badge tone="neutral">{{ formatDateTime(row.lastVisit) }}</mb-badge>
                }
              </div>
            </div>
          }
          @if (filtered().length === 0) {
            <p class="py-8 text-center text-sm text-slate-500">No customers match your search.</p>
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
      [title]="editingId() ? 'Edit customer' : 'Add customer'"
      size="lg"
      (backdropClose)="closeForm()"
      (closeClick)="closeForm()"
    >
      <form class="space-y-4" [formGroup]="custForm" (ngSubmit)="saveCustomer()">
        <mb-field label="Branch">
          <mb-select formControlName="branchId" [options]="customerBranchOptions()" placeholder="Branch" />
        </mb-field>
        <mb-field label="Full name">
          <input class="mb-input" formControlName="fullName" />
        </mb-field>
        <mb-field label="Phone">
          <mb-phone-input formControlName="phone" />
        </mb-field>
        <mb-field label="WhatsApp">
          <mb-phone-input formControlName="whatsapp" />
        </mb-field>
        <mb-field label="Notes">
          <textarea class="mb-input min-h-[88px] resize-y" formControlName="notes"></textarea>
        </mb-field>
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="custForm.invalid">Save</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="closeForm()">Cancel</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-modal
      [open]="detailOpen()"
      [title]="detailCustomer()?.fullName ?? 'Customer'"
      subtitle="Profile"
      size="md"
      (backdropClose)="detailOpen.set(false)"
      (closeClick)="detailOpen.set(false)"
    >
      @if (detailCustomer(); as c) {
        <dl class="space-y-3 text-sm">
          <div>
            <dt class="text-slate-500">Branch</dt>
            <dd class="font-medium">{{ detailBranch()?.name }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Phone</dt>
            <dd class="font-medium">{{ c.phone || '—' }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">WhatsApp</dt>
            <dd class="font-medium">{{ c.whatsapp || '—' }}</dd>
          </div>
          <div>
            <dt class="text-slate-500">Notes</dt>
            <dd class="font-medium">{{ c.notes || '—' }}</dd>
          </div>
        </dl>
      }
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmDelete()"
      title="Delete customer?"
      message="This removes the CRM record only. Transaction history keeps snapshots."
      confirmLabel="Delete"
      [danger]="true"
      (confirm)="doDelete()"
      (cancel)="confirmDelete.set(false)"
    />
  `,
})
export class CustomersPageComponent {
  readonly auth = inject(AuthService);
  readonly db = inject(MockDatabaseService);
  private readonly fb = inject(FormBuilder);

  readonly formatDateTime = formatDateTime;

  readonly query = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly branches = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.db.listBranchesVisibleTo(u) : [];
  });

  readonly customerBranchOptions = computed((): MbSelectOption[] =>
    this.branches().map((b) => ({ value: b.id, label: b.name })),
  );

  readonly rows = computed(() => {
    const u = this.auth.currentUser();
    const branches = u ? this.db.listBranchesVisibleTo(u) : [];
    const out: {
      customer: Customer;
      branch: Branch;
      visits: number;
      lastVisit: string | null;
    }[] = [];
    for (const b of branches) {
      for (const c of this.db.listCustomersForBranch(b.id)) {
        out.push({
          customer: c,
          branch: b,
          visits: this.db.customerVisitCount(c.id),
          lastVisit: this.db.lastVisitForCustomer(c.id),
        });
      }
    }
    return out.sort((a, b) => (b.lastVisit ?? '').localeCompare(a.lastVisit ?? ''));
  });

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
      if (r.customer.whatsapp) {
        withWa += 1;
      }
      branches.add(r.branch.id);
    }
    const n = rows.length;
    const withWaPct = n ? Math.round((withWa / n) * 100) : 0;
    return { count: n, visits, withWa, withWaPct: '' + withWaPct, branchCount: branches.size };
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

  readonly customerMenuItems: MbActionMenuItem[] = [
    { id: 'view', label: 'View details' },
    { id: 'edit', label: 'Edit' },
    { id: 'del', label: 'Delete', danger: true },
  ];

  readonly formOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly detailOpen = signal(false);
  readonly detailCustomer = signal<Customer | null>(null);
  readonly detailBranch = signal<Branch | null>(null);
  readonly confirmDelete = signal(false);
  readonly deleteTarget = signal<string | null>(null);

  readonly custForm = this.fb.nonNullable.group({
    branchId: ['', Validators.required],
    fullName: ['', Validators.required],
    phone: [''],
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
    row: { customer: Customer; branch: Branch },
    id: string,
  ): void {
    if (id === 'view') {
      this.detailCustomer.set(row.customer);
      this.detailBranch.set(row.branch);
      this.detailOpen.set(true);
    }
    if (id === 'edit') {
      this.editingId.set(row.customer.id);
      this.custForm.patchValue({
        branchId: row.customer.branchId,
        fullName: row.customer.fullName,
        phone: row.customer.phone ?? '',
        whatsapp: row.customer.whatsapp ?? '',
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
    const first = this.branches()[0]?.id ?? '';
    this.custForm.reset({
      branchId: first,
      fullName: '',
      phone: '',
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
    if (this.editingId()) {
      this.db.updateCustomer(this.editingId()!, {
        branchId: v.branchId,
        fullName: v.fullName,
        phone: v.phone || null,
        whatsapp: v.whatsapp || null,
        notes: v.notes || null,
      });
    } else {
      this.db.createCustomer({
        branchId: v.branchId,
        fullName: v.fullName,
        phone: v.phone || null,
        whatsapp: v.whatsapp || null,
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
}
