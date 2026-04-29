import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { BarberProfile, OwnerDashboardBarberRow } from '../../data/models/domain.types';
import { AuthService } from '../../core/auth/auth.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { MbActionMenuComponent, type MbActionMenuItem } from '../../shared/ui/mb-action-menu.component';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { MbConfirmDialogComponent } from '../../shared/ui/mb-confirm-dialog.component';
import { MbFieldComponent } from '../../shared/ui/mb-field.component';
import { MbModalComponent } from '../../shared/ui/mb-modal.component';
import { MbAvatarComponent } from '../../shared/ui/mb-avatar.component';
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { MbSelectComponent, type MbSelectOption } from '../../shared/ui/mb-select.component';
import { MbTablePaginatorComponent } from '../../shared/ui/mb-table-paginator.component';
import { formatPct, formatUsd } from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-barbers-page',
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
  ],
  template: `
    <div class="mx-auto max-w-7xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">Barbers</h1>
          <p class="mb-page-sub">Roster · commissions · mock earnings</p>
        </div>
        <div class="mb-toolbar w-full max-w-xl sm:flex-1 sm:justify-end">
          <input
            type="search"
            class="mb-input min-w-0 flex-1"
            placeholder="Search barber or branch…"
            [value]="query()"
            (input)="onQueryInput($event)"
          />
          @if (auth.canManageBarbers()) {
            <mb-btn (click)="openCreate()">Create barber account</mb-btn>
          }
        </div>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" label="Barbers" [value]="'' + barberStats().total" hint="In view" />
        <mb-quick-stat-tile variant="emerald" label="Active" [value]="'' + barberStats().active" />
        <mb-quick-stat-tile
          variant="amber"
          label="Gross services"
          [value]="formatUsd(barberStats().gross)"
        />
        <mb-quick-stat-tile
          variant="sky"
          label="Barber payouts"
          [value]="formatUsd(barberStats().earned)"
        />
      </mb-quick-stats-row>

      <mb-card [title]="'Team roster (' + filtered().length + ')'" subtitle="Sorted by gross service total" [padding]="false">
        <div class="mb-table-wrap hidden lg:block">
          <table class="w-full min-w-[760px]">
            <thead>
              <tr class="mb-table-head">
                <th>Barber</th>
                <th>Branch</th>
                <th>Split</th>
                <th class="text-right">Services</th>
                <th class="text-right">Gross</th>
                <th class="text-right">Earned</th>
                <th>Status</th>
                <th class="w-14"></th>
              </tr>
            </thead>
            <tbody>
              @for (row of paged(); track row.barber.id) {
                <tr class="mb-table-row">
                  <td class="mb-table-cell">
                    <div class="flex items-center gap-3">
                      <mb-avatar
                        [label]="row.barber.displayName"
                        [photoUrl]="db.resolveBarberProfilePhotoUrl(row.barber.id)"
                        size="sm"
                      />
                      <span class="font-semibold text-slate-900 dark:text-slate-100">{{ row.barber.displayName }}</span>
                    </div>
                  </td>
                  <td class="mb-table-cell">
                    <mb-badge tone="neutral" [caps]="false">{{ row.branch.name }}</mb-badge>
                  </td>
                  <td class="mb-table-cell">
                    <mb-badge tone="success" [caps]="false">{{ formatPct(row.barber.commissionPercent) }}</mb-badge>
                  </td>
                  <td class="mb-table-cell text-right tabular-nums text-slate-600 dark:text-slate-400">
                    {{ row.servicesCount }}
                  </td>
                  <td class="mb-table-cell text-right tabular-nums text-slate-700 dark:text-slate-300">
                    {{ formatUsd(row.revenue) }}
                  </td>
                  <td class="mb-table-cell text-right text-base font-semibold tabular-nums text-slate-900 dark:text-white">
                    {{ formatUsd(row.barberEarnings) }}
                  </td>
                  <td class="mb-table-cell">
                    <mb-badge [tone]="row.barber.isActive ? 'success' : 'neutral'" [caps]="false">
                      {{ row.barber.isActive ? 'Active' : 'Off' }}
                    </mb-badge>
                  </td>
                  <td class="mb-table-cell text-right">
                    <mb-action-menu [items]="menuForRow()" (picked)="onBarberMenu(row, $event)" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="space-y-3 p-4 lg:hidden">
          @for (row of paged(); track row.barber.id) {
            <div
              class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex min-w-0 items-center gap-3">
                  <mb-avatar
                    [label]="row.barber.displayName"
                    [photoUrl]="db.resolveBarberProfilePhotoUrl(row.barber.id)"
                    size="sm"
                  />
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-900 dark:text-white">{{ row.barber.displayName }}</p>
                    <p class="text-xs text-slate-500">{{ row.branch.name }}</p>
                  </div>
                </div>
                <mb-action-menu [items]="menuForRow()" (picked)="onBarberMenu(row, $event)" />
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <mb-badge tone="success" [caps]="false">{{ formatPct(row.barber.commissionPercent) }}</mb-badge>
                <mb-badge [tone]="row.barber.isActive ? 'success' : 'neutral'" [caps]="false">
                  {{ row.barber.isActive ? 'Active' : 'Inactive' }}
                </mb-badge>
              </div>
              <dl class="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt class="text-slate-500">Services</dt>
                  <dd class="font-semibold">{{ row.servicesCount }}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Gross</dt>
                  <dd class="font-semibold tabular-nums">{{ formatUsd(row.revenue) }}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">Earned</dt>
                  <dd class="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {{ formatUsd(row.barberEarnings) }}
                  </dd>
                </div>
              </dl>
            </div>
          }
          @if (filtered().length === 0) {
            <p class="py-8 text-center text-sm text-slate-500">No barbers match your search.</p>
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
      [title]="creating() ? 'Create barber account' : 'Edit barber'"
      size="lg"
      (backdropClose)="closeForm()"
      (closeClick)="closeForm()"
    >
      <form class="space-y-4" [formGroup]="barberForm" (ngSubmit)="saveBarber()">
        @if (creating()) {
          <mb-field label="Work email (login)" hint="Demo auth still uses email match only">
            <input type="email" class="mb-input" formControlName="email" autocomplete="off" />
          </mb-field>
          <mb-field label="Full name">
            <input class="mb-input" formControlName="fullName" />
          </mb-field>
        }
        <mb-field label="Display name">
          <input class="mb-input" formControlName="displayName" />
        </mb-field>
        <mb-field label="Branch">
          <mb-select formControlName="branchId" [options]="barberBranchOptions()" placeholder="Branch" />
        </mb-field>
        <mb-field label="Commission %" hint="Barber share of service total">
          <input type="number" min="0" max="100" class="mb-input tabular-nums" formControlName="commissionPercent" />
        </mb-field>
        @if (!creating()) {
          <mb-field label="Status">
            <mb-select formControlName="isActive" [options]="activeStatusOptions" placeholder="Status" />
          </mb-field>
        }
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="barberForm.invalid">Save</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="closeForm()">Cancel</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmOff()"
      title="Deactivate barber?"
      message="They’ll disappear from active selectors; history stays in mock data."
      confirmLabel="Deactivate"
      [danger]="true"
      (confirm)="doDeactivate()"
      (cancel)="confirmOff.set(false)"
    />
  `,
})
export class BarbersPageComponent {
  readonly auth = inject(AuthService);
  readonly db = inject(MockDatabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly formatUsd = formatUsd;
  readonly formatPct = formatPct;

  readonly query = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly branches = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.db.listBranchesVisibleTo(u) : [];
  });

  readonly barberBranchOptions = computed((): MbSelectOption[] =>
    this.branches().map((b) => ({ value: b.id, label: b.name })),
  );

  readonly activeStatusOptions: MbSelectOption[] = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  readonly table = computed((): OwnerDashboardBarberRow[] => {
    const u = this.auth.currentUser();
    const allowed = new Set(u ? this.db.listBranchesVisibleTo(u).map((b) => b.id) : []);
    const dashMap = new Map(this.db.getOwnerDashboard().byBarber.map((r) => [r.barber.id, r]));
    const profiles = this.db.barbers().filter((b) => allowed.has(b.branchId));
    const merged = profiles.map((b) => {
      const hit = dashMap.get(b.id);
      if (hit) {
        return hit;
      }
      const br = this.db.getBranch(b.branchId);
      return {
        barber: b,
        branch: br!,
        servicesCount: 0,
        revenue: 0,
        barberEarnings: 0,
      };
    });
    return merged.sort((a, b) => b.revenue - a.revenue);
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    let rows = this.table();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.barber.displayName.toLowerCase().includes(q) ||
          r.branch.name.toLowerCase().includes(q),
      );
    }
    return rows;
  });

  readonly barberStats = computed(() => {
    const rows = this.filtered();
    let active = 0;
    let gross = 0;
    let earned = 0;
    for (const r of rows) {
      if (r.barber.isActive) {
        active += 1;
      }
      gross += r.revenue;
      earned += r.barberEarnings;
    }
    return { total: rows.length, active, gross, earned };
  });

  readonly paged = computed(() => {
    const rows = this.filtered();
    const start = this.pageIndex() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((m) => {
      if (m.get('add') !== '1' || !this.auth.canManageBarbers()) {
        return;
      }
      this.openCreate();
      void this.router.navigate([], { relativeTo: this.route, replaceUrl: true, queryParams: {} });
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

  menuForRow(): MbActionMenuItem[] {
    if (this.auth.canManageBarbers()) {
      return [
        { id: 'perf', label: 'View performance' },
        { id: 'edit', label: 'Edit barber' },
        { id: 'off', label: 'Deactivate', danger: true },
      ];
    }
    return [{ id: 'perf', label: 'View performance' }];
  }

  readonly formOpen = signal(false);
  readonly creating = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly confirmOff = signal(false);
  readonly offTarget = signal<string | null>(null);

  readonly barberForm = this.fb.nonNullable.group({
    email: ['', [Validators.email]],
    fullName: [''],
    displayName: ['', Validators.required],
    branchId: ['', Validators.required],
    commissionPercent: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
    isActive: this.fb.nonNullable.control<'true' | 'false'>('true'),
  });

  onBarberMenu(row: OwnerDashboardBarberRow, id: string): void {
    if (id === 'perf') {
      void this.router.navigate(['/transactions'], { queryParams: { barber: row.barber.id } });
    }
    if (id === 'edit' && this.auth.canManageBarbers()) {
      this.openEdit(row.barber);
    }
    if (id === 'off' && this.auth.canManageBarbers()) {
      this.offTarget.set(row.barber.id);
      this.confirmOff.set(true);
    }
  }

  openCreate(): void {
    this.creating.set(true);
    this.editingId.set(null);
    const first = this.branches()[0]?.id ?? '';
    this.barberForm.reset({
      email: '',
      fullName: '',
      displayName: '',
      branchId: first,
      commissionPercent: 60,
      isActive: 'true',
    });
    this.barberForm.get('email')?.setValidators([Validators.required, Validators.email]);
    this.barberForm.get('fullName')?.setValidators([Validators.required]);
    this.barberForm.get('email')?.updateValueAndValidity();
    this.barberForm.get('fullName')?.updateValueAndValidity();
    this.formOpen.set(true);
  }

  openEdit(b: BarberProfile): void {
    this.creating.set(false);
    this.editingId.set(b.id);
    this.barberForm.get('email')?.clearValidators();
    this.barberForm.get('fullName')?.clearValidators();
    this.barberForm.get('email')?.updateValueAndValidity();
    this.barberForm.get('fullName')?.updateValueAndValidity();
    this.barberForm.patchValue({
      displayName: b.displayName,
      branchId: b.branchId,
      commissionPercent: b.commissionPercent,
      isActive: b.isActive ? 'true' : 'false',
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  saveBarber(): void {
    if (this.barberForm.invalid) {
      return;
    }
    const v = this.barberForm.getRawValue();
    if (this.creating()) {
      this.db.createBarberAccount({
        email: v.email,
        fullName: v.fullName,
        branchId: v.branchId,
        displayName: v.displayName,
        commissionPercent: v.commissionPercent,
      });
    } else {
      const id = this.editingId();
      if (id) {
        this.db.updateBarberProfile(id, {
          displayName: v.displayName,
          branchId: v.branchId,
          commissionPercent: v.commissionPercent,
          isActive: v.isActive === 'true',
        });
      }
    }
    this.closeForm();
  }

  doDeactivate(): void {
    const id = this.offTarget();
    if (id) {
      this.db.setBarberActive(id, false);
    }
    this.confirmOff.set(false);
    this.offTarget.set(null);
  }

  onQueryInput(ev: Event): void {
    const t = ev.target as HTMLInputElement | null;
    this.query.set(t?.value ?? '');
    this.pageIndex.set(0);
  }

  onPageSizeChange(n: number): void {
    this.pageSize.set(n);
    this.pageIndex.set(0);
  }
}
