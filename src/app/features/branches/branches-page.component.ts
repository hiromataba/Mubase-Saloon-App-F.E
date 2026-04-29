import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { Branch, BranchStaffRole } from '../../data/models/domain.types';
import { AuthService } from '../../core/auth/auth.service';
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
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbSelectComponent, type MbSelectOption } from '../../shared/ui/mb-select.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { formatUsd } from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-branches-page',
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
    MbSelectComponent,
    MbPhoneInputComponent,
  ],
  template: `
    <div class="mx-auto max-w-7xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">{{ i18n.t('page.branches.title') }}</h1>
          <p class="mb-page-sub">{{ i18n.t('page.branches.subtitle') }}</p>
        </div>
        @if (isOwner()) {
          <mb-btn (click)="openAdd()">{{ i18n.t('page.branches.modalAdd') }}</mb-btn>
        }
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" [label]="i18n.t('page.branches.statLocations')" [value]="'' + branchPortfolioStats().count" />
        <mb-quick-stat-tile variant="emerald" [label]="i18n.t('page.branches.statActive')" [value]="'' + branchPortfolioStats().active" />
        <mb-quick-stat-tile
          variant="amber"
          [label]="i18n.t('page.branches.statRevenue')"
          [value]="formatUsd(branchPortfolioStats().revenue)"
        />
        <mb-quick-stat-tile variant="sky" [label]="i18n.t('page.branches.statTransactions')" [value]="'' + branchPortfolioStats().tx" />
      </mb-quick-stats-row>

      <div class="grid gap-6 md:grid-cols-2 lg:gap-8">
        @for (row of rows(); track row.branch.id) {
          <mb-card [padding]="false">
            <div class="p-6">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <mb-badge tone="info">{{ row.branch.code }}</mb-badge>
                  <h2 class="mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white">
                    {{ row.branch.name }}
                  </h2>
                  <p class="mt-1 text-sm text-slate-500">{{ row.branch.address }}</p>
                  <p class="mt-0.5 text-sm text-slate-500">{{ row.branch.phone }}</p>
                </div>
                <div class="flex shrink-0 items-start gap-2">
                  <mb-badge [tone]="row.branch.isActive ? 'success' : 'neutral'">
                    {{ row.branch.isActive ? i18n.t('page.branches.statusActive') : i18n.t('page.branches.statusInactive') }}
                  </mb-badge>
                  @if (isOwner()) {
                    <mb-action-menu [items]="branchMenuItems()" (picked)="onBranchMenu(row.branch, $event)" />
                  }
                </div>
              </div>
              <dl class="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.t('page.branches.cardRevenueDt') }}</dt>
                  <dd class="mt-1 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {{ formatUsd(row.revenue) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.t('page.branches.cardShopDt') }}</dt>
                  <dd class="mt-1 font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {{ formatUsd(row.shopEarnings) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ i18n.t('page.branches.cardTxDt') }}</dt>
                  <dd class="mt-1 font-semibold text-slate-900 dark:text-white">{{ row.transactionCount }}</dd>
                </div>
              </dl>
            </div>
          </mb-card>
        }
      </div>
    </div>

    <mb-modal
      [open]="detailOpen()"
      [title]="detailBranch()?.name ?? i18n.t('page.branches.modalDetailFallback')"
      [description]="i18n.t('page.branches.modalDetailDesc')"
      size="lg"
      (backdropClose)="detailOpen.set(false)"
      (closeClick)="detailOpen.set(false)"
    >
      @if (detailBranch(); as b) {
        <div class="space-y-6">
          <dl class="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-slate-500">{{ i18n.t('page.branches.labelCode') }}</dt>
              <dd class="font-medium">{{ b.code }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ i18n.t('page.branches.labelPhone') }}</dt>
              <dd class="font-medium">{{ b.phone || '—' }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-slate-500">{{ i18n.t('page.branches.labelAddress') }}</dt>
              <dd class="font-medium">{{ b.address || '—' }}</dd>
            </div>
          </dl>
          @if (isOwner()) {
            <div class="rounded-xl border border-slate-100 dark:border-slate-800">
              <p class="border-b border-slate-100 px-4 py-3 text-sm font-semibold dark:border-slate-800">
                {{ i18n.t('page.branches.staffAccess') }}
              </p>
              <ul class="divide-y divide-slate-100 dark:divide-slate-800">
                @for (s of staffRows(); track s.id) {
                  <li class="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <div>
                      <p class="font-medium">{{ s.fullName }}</p>
                      <p class="text-xs text-slate-500">{{ i18n.staffRoleLabel(s.role) }}</p>
                    </div>
                    <mb-btn variant="ghost" size="sm" (click)="removeStaff(s.id)">{{
                      i18n.t('page.branches.removeStaffBtn')
                    }}</mb-btn>
                  </li>
                }
                @if (staffRows().length === 0) {
                  <li class="px-4 py-6 text-center text-sm text-slate-500">{{ i18n.t('page.branches.noStaffMock') }}</li>
                }
              </ul>
              <div class="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {{ i18n.t('page.branches.assignSection') }}
                </p>
                <div class="grid gap-3 sm:grid-cols-3">
                  <mb-field [label]="i18n.t('page.branches.fieldUser')">
                    <mb-select
                      [formControl]="assignForm.controls.userId"
                      [options]="assignUserOptions()"
                      [placeholder]="i18n.t('page.branches.placeholderSelect')"
                    />
                  </mb-field>
                  <mb-field [label]="i18n.t('page.staff.fieldRole')">
                    <mb-select
                      [formControl]="assignForm.controls.role"
                      [options]="staffRoleOptions()"
                      [placeholder]="i18n.t('page.staff.placeholderRole')"
                    />
                  </mb-field>
                  <div class="flex items-end">
                    <mb-btn class="w-full sm:w-auto" variant="secondary" (click)="submitAssign()">{{
                      i18n.t('page.branches.assignSubmit')
                    }}</mb-btn>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </mb-modal>

    <mb-modal
      [open]="editOpen()"
      [title]="adding() ? i18n.t('page.branches.modalAdd') : i18n.t('page.branches.modalEdit')"
      size="lg"
      (backdropClose)="closeEdit()"
      (closeClick)="closeEdit()"
    >
      <form class="space-y-6" [formGroup]="branchForm" (ngSubmit)="saveBranch()">
        @if (branchModalError()) {
          <p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{{ branchModalError() }}</p>
        }
        <mb-field [label]="i18n.t('page.branches.fieldName')">
          <input class="mb-input" formControlName="name" />
        </mb-field>
        <mb-field [label]="i18n.t('page.branches.fieldCode')" [hint]="i18n.t('page.branches.fieldCodeHint')">
          <input class="mb-input" formControlName="code" />
        </mb-field>
        <mb-field [label]="i18n.t('page.branches.fieldAddress')">
          <input class="mb-input" formControlName="address" />
        </mb-field>
        <mb-field [label]="i18n.t('page.branches.fieldPhone')">
          <mb-phone-input formControlName="phone" />
        </mb-field>
        <mb-field [label]="i18n.t('page.branches.fieldStatus')">
          <mb-select
            formControlName="isActive"
            [options]="activeStatusOptions()"
            [placeholder]="i18n.t('page.branches.placeholderStatus')"
          />
        </mb-field>
        @if (adding()) {
          <label
            class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-slate-50/80 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40"
          >
            <input
              type="checkbox"
              formControlName="createStaffAccount"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-mb-primary focus:ring-mb-primary"
            />
            <span>
              <span class="font-semibold text-slate-900 dark:text-slate-100">{{ i18n.t('page.branches.createStaffLabel') }}</span>
              <span class="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">
                {{ i18n.t('page.branches.createStaffHint') }}
              </span>
            </span>
          </label>
        }
        @if (adding() && branchForm.controls.createStaffAccount.value) {
          <mb-field [label]="i18n.t('page.branches.staffManagerPassword')">
            <input type="password" class="mb-input" formControlName="staffPassword" autocomplete="new-password" />
          </mb-field>
          <mb-field [label]="i18n.t('page.branches.staffManagerPasswordConfirm')">
            <input type="password" class="mb-input" formControlName="staffPasswordConfirm" autocomplete="new-password" />
          </mb-field>
        }
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="branchForm.invalid">{{ i18n.t('common.save') }}</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="closeEdit()">{{ i18n.t('common.cancel') }}</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmDeactivate()"
      [title]="i18n.t('page.branches.confirmDeactivateTitle')"
      [message]="i18n.t('page.branches.confirmDeactivateMessage')"
      [confirmLabel]="i18n.t('common.deactivate')"
      [danger]="true"
      (confirm)="confirmDeactivateBranch()"
      (cancel)="confirmDeactivate.set(false)"
    />

    <mb-confirm-dialog
      [open]="confirmStaffRemove()"
      [title]="i18n.t('page.branches.confirmStaffRemoveTitle')"
      [message]="i18n.t('page.branches.confirmStaffRemoveMessage')"
      [confirmLabel]="i18n.t('common.remove')"
      [danger]="true"
      (confirm)="confirmRemoveStaff()"
      (cancel)="confirmStaffRemove.set(false)"
    />
  `,
})
export class BranchesPageComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly db = inject(MockDatabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  /** Re-compute assignable users when role changes (same person can be manager + accountant). */
  private readonly assignRoleBump = signal(0);

  readonly formatUsd = formatUsd;

  readonly rows = computed(() => {
    const u = this.auth.currentUser();
    if (!u) {
      return [];
    }
    const dashMap = new Map(this.db.getOwnerDashboard().byBranch.map((r) => [r.branch.id, r]));
    const list = u.isOwner ? [...this.db.branches()] : this.db.listBranchesVisibleTo(u);
    return list.map((b) => {
      const hit = dashMap.get(b.id);
      if (hit) {
        return hit;
      }
      return {
        branch: b,
        transactionCount: 0,
        revenue: 0,
        barberEarnings: 0,
        shopEarnings: 0,
      };
    });
  });

  readonly branchPortfolioStats = computed(() => {
    let active = 0;
    let revenue = 0;
    let tx = 0;
    for (const r of this.rows()) {
      if (r.branch.isActive) {
        active += 1;
      }
      revenue += r.revenue;
      tx += r.transactionCount;
    }
    return { count: this.rows().length, active, revenue, tx };
  });

  readonly isOwner = computed(() => !!this.auth.currentUser()?.isOwner);

  readonly branchMenuItems = computed((): MbActionMenuItem[] => [
    { id: 'detail', label: this.i18n.t('actionMenu.viewDetails') },
    { id: 'edit', label: this.i18n.t('actionMenu.edit') },
    { id: 'tx', label: this.i18n.t('actionMenu.openTransactions') },
    { id: 'deactivate', label: this.i18n.t('actionMenu.deactivate'), danger: true },
  ]);

  readonly detailOpen = signal(false);
  readonly detailBranch = signal<Branch | null>(null);
  readonly editOpen = signal(false);
  readonly adding = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly confirmDeactivate = signal(false);
  readonly deactivateTarget = signal<string | null>(null);
  readonly confirmStaffRemove = signal(false);
  readonly staffRemoveTarget = signal<string | null>(null);
  readonly branchModalError = signal<string | null>(null);

  readonly branchForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    address: [''],
    phone: [''],
    isActive: this.fb.nonNullable.control<'true' | 'false'>('true'),
    createStaffAccount: [false],
    staffPassword: [''],
    staffPasswordConfirm: [''],
  });

  readonly assignForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    role: this.fb.nonNullable.control<BranchStaffRole>('MANAGER'),
  });

  readonly activeStatusOptions = computed((): MbSelectOption[] => [
    { value: 'true', label: this.i18n.t('page.branches.statusActive') },
    { value: 'false', label: this.i18n.t('page.branches.statusInactive') },
  ]);

  readonly staffRoleOptions = computed((): MbSelectOption[] => [
    { value: 'MANAGER', label: this.i18n.t('login.role.manager') },
    { value: 'ACCOUNTANT', label: this.i18n.t('login.role.accountant') },
    { value: 'RECEPTIONIST', label: this.i18n.t('login.role.receptionist') },
  ]);

  readonly assignUserOptions = computed((): MbSelectOption[] => [
    { value: '', label: this.i18n.t('page.branches.placeholderSelect') },
    ...this.assignableUsers().map((u) => ({ value: u.id, label: u.fullName })),
  ]);

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((m) => {
      if (m.get('add') !== '1') {
        return;
      }
      this.openAdd();
      void this.router.navigate([], { relativeTo: this.route, replaceUrl: true, queryParams: {} });
    });

    this.assignForm.get('role')?.valueChanges.subscribe(() => this.assignRoleBump.update((n) => n + 1));
  }

  readonly staffRows = computed(() => {
    const b = this.detailBranch();
    if (!b) {
      return [];
    }
    return this.db.listStaffForBranch(b.id).map((s) => ({
      id: s.id,
      role: s.role,
      fullName: this.db.getUserById(s.userId)?.fullName ?? s.userId,
    }));
  });

  readonly assignableUsers = computed(() => {
    this.assignRoleBump();
    const b = this.detailBranch();
    if (!b) {
      return [];
    }
    const role = this.assignForm.get('role')?.value ?? 'MANAGER';
    return this.db.listUsersAssignableToBranch(b.id, role);
  });

  onBranchMenu(branch: Branch, id: string): void {
    if (id === 'detail') {
      this.detailBranch.set(branch);
      this.detailOpen.set(true);
      this.assignForm.reset({ userId: '', role: 'MANAGER' });
    }
    if (id === 'edit') {
      this.openEdit(branch);
    }
    if (id === 'tx') {
      void this.router.navigate(['/transactions'], { queryParams: { branch: branch.id } });
    }
    if (id === 'deactivate') {
      this.deactivateTarget.set(branch.id);
      this.confirmDeactivate.set(true);
    }
  }

  openAdd(): void {
    this.adding.set(true);
    this.editingId.set(null);
    this.branchModalError.set(null);
    this.branchForm.reset({
      name: '',
      code: '',
      address: '',
      phone: '',
      isActive: 'true',
      createStaffAccount: false,
      staffPassword: '',
      staffPasswordConfirm: '',
    });
    this.editOpen.set(true);
  }

  openEdit(b: Branch): void {
    this.adding.set(false);
    this.editingId.set(b.id);
    this.branchModalError.set(null);
    this.branchForm.patchValue({
      name: b.name,
      code: b.code,
      address: b.address ?? '',
      phone: b.phone ?? '',
      isActive: b.isActive ? 'true' : 'false',
      createStaffAccount: false,
      staffPassword: '',
      staffPasswordConfirm: '',
    });
    this.editOpen.set(true);
  }

  closeEdit(): void {
    this.editOpen.set(false);
    this.branchModalError.set(null);
  }

  saveBranch(): void {
    if (this.branchForm.invalid) {
      return;
    }
    const v = this.branchForm.getRawValue();
    this.branchModalError.set(null);
    const i = this.i18n;
    const active = v.isActive === 'true';
    if (this.adding()) {
      if (v.createStaffAccount) {
        const sp = (v.staffPassword ?? '').trim();
        const sc = (v.staffPasswordConfirm ?? '').trim();
        if (sp.length < 8) {
          this.branchModalError.set(i.t('validation.passwordMin8'));
          return;
        }
        if (sp !== sc) {
          this.branchModalError.set(i.t('validation.passwordMismatch'));
          return;
        }
      }
      const branch = this.db.createBranch({
        name: v.name,
        code: v.code,
        address: v.address || null,
        phone: v.phone || null,
        isActive: active,
      });
      if (v.createStaffAccount) {
        const sp = (v.staffPassword ?? '').trim();
        const slug = branch.id.replace(/^br-/, '');
        const user = this.db.createUser({
          email: `manager.${slug}@mubase.mock`,
          fullName: `${v.name.trim()} — manager`,
          phone: v.phone || null,
          password: sp,
          isOwner: false,
          isActive: true,
        });
        try {
          this.db.assignStaff({ userId: user.id, branchId: branch.id, role: 'MANAGER' });
        } catch {
          /* duplicate assignment — ignore in mock */
        }
      }
    } else {
      const id = this.editingId();
      if (id) {
        this.db.updateBranch(id, {
          name: v.name,
          code: v.code,
          address: v.address || null,
          phone: v.phone || null,
          isActive: active,
        });
      }
    }
    this.closeEdit();
  }

  confirmDeactivateBranch(): void {
    const id = this.deactivateTarget();
    if (id) {
      this.db.setBranchActive(id, false);
    }
    this.confirmDeactivate.set(false);
    this.deactivateTarget.set(null);
  }

  submitAssign(): void {
    if (this.assignForm.invalid || !this.detailBranch()) {
      return;
    }
    const v = this.assignForm.getRawValue();
    try {
      this.db.assignStaff({ userId: v.userId, branchId: this.detailBranch()!.id, role: v.role });
      this.assignForm.reset({ userId: '', role: 'MANAGER' });
    } catch {
      /* duplicate — ignore in mock */
    }
  }

  removeStaff(staffId: string): void {
    this.staffRemoveTarget.set(staffId);
    this.confirmStaffRemove.set(true);
  }

  confirmRemoveStaff(): void {
    const id = this.staffRemoveTarget();
    if (id) {
      this.db.removeStaffAssignment(id);
    }
    this.confirmStaffRemove.set(false);
    this.staffRemoveTarget.set(null);
  }
}
