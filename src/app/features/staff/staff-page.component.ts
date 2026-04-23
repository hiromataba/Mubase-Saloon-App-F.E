import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { BranchStaffRole } from '../../data/models/domain.types';
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

@Component({
  standalone: true,
  selector: 'app-staff-page',
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
      <div class="mb-page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:gap-8">
        <div>
          <h1 class="mb-page-title">Staff</h1>
          <p class="mb-page-sub">Managers, accountants, assignments · owner only (mock)</p>
        </div>
        <mb-btn (click)="openInvite()">Create staff & assign</mb-btn>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" label="Assignments" [value]="'' + staffStats().total" />
        <mb-quick-stat-tile variant="emerald" label="Managers" [value]="'' + staffStats().managers" />
        <mb-quick-stat-tile variant="amber" label="Accountants" [value]="'' + staffStats().accountants" />
        <mb-quick-stat-tile variant="sky" label="Branches" [value]="'' + staffStats().branches" />
      </mb-quick-stats-row>

      <mb-card [title]="'All assignments (' + rows().length + ')'" subtitle="Across barbershops" [padding]="false">
        <div class="mb-table-wrap hidden lg:block">
          <table class="w-full min-w-[820px]">
            <thead>
              <tr class="mb-table-head">
                <th>Name</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Role</th>
                <th class="w-14"></th>
              </tr>
            </thead>
            <tbody>
              @for (row of paged(); track row.assignment.id) {
                <tr class="mb-table-row">
                  <td class="mb-table-cell">
                    <div class="flex items-center gap-3">
                      <mb-avatar
                        [label]="row.user.fullName"
                        [photoUrl]="db.resolveUserPhotoUrl(row.user.id)"
                        size="sm"
                      />
                      <span class="font-semibold text-slate-900 dark:text-slate-100">{{ row.user.fullName }}</span>
                    </div>
                  </td>
                  <td class="mb-table-cell text-sm text-slate-600 dark:text-slate-400">{{ row.user.email }}</td>
                  <td class="mb-table-cell">
                    <mb-badge tone="neutral" [caps]="false">{{ row.branch.name }}</mb-badge>
                  </td>
                  <td class="mb-table-cell">
                    <mb-badge [tone]="roleTone(row.assignment.role)" [caps]="false">{{ row.assignment.role }}</mb-badge>
                  </td>
                  <td class="mb-table-cell text-right">
                    <mb-action-menu [items]="staffMenuItems" (picked)="onStaffMenu(row.assignment.id, $event)" />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="space-y-3 p-4 lg:hidden">
          @for (row of paged(); track row.assignment.id) {
            <div
              class="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-semibold text-slate-900 dark:text-white">{{ row.user.fullName }}</p>
                  <p class="text-xs text-slate-500">{{ row.user.email }}</p>
                </div>
                <mb-action-menu [items]="staffMenuItems" (picked)="onStaffMenu(row.assignment.id, $event)" />
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <mb-badge tone="neutral">{{ row.branch.name }}</mb-badge>
                <mb-badge [tone]="roleTone(row.assignment.role)">{{ row.assignment.role }}</mb-badge>
              </div>
            </div>
          }
        </div>

        <mb-table-paginator
          [total]="rows().length"
          [page]="pageIndex()"
          [pageSize]="pageSize()"
          (pageChange)="pageIndex.set($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        />
      </mb-card>
    </div>

    <mb-modal
      [open]="inviteOpen()"
      title="Create staff account"
      description="Adds a login user and assigns a role at one barbershop."
      size="lg"
      (backdropClose)="inviteOpen.set(false)"
      (closeClick)="inviteOpen.set(false)"
    >
      <form class="space-y-4" [formGroup]="inviteForm" (ngSubmit)="submitInvite()">
        <mb-field label="Work email">
          <input type="email" class="mb-input" formControlName="email" autocomplete="off" />
        </mb-field>
        <mb-field label="Full name">
          <input class="mb-input" formControlName="fullName" />
        </mb-field>
        <mb-field label="Barbershop">
          <mb-select formControlName="branchId" [options]="inviteBranchOptions()" placeholder="Branch" />
        </mb-field>
        <mb-field label="Role">
          <mb-select formControlName="role" [options]="staffRoleOptions" placeholder="Role" />
        </mb-field>
        <p class="text-xs text-slate-500">
          Same person can hold manager + accountant at one shop: add one role, save, then add the second role
          with the same email (mock creates a second assignment).
        </p>
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="inviteForm.invalid">Create & assign</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="inviteOpen.set(false)">Cancel</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmRemove()"
      title="Remove assignment?"
      message="They lose access to this branch until reassigned (mock only)."
      confirmLabel="Remove"
      [danger]="true"
      (confirm)="doRemove()"
      (cancel)="confirmRemove.set(false)"
    />
  `,
})
export class StaffPageComponent {
  readonly db = inject(MockDatabaseService);
  private readonly fb = inject(FormBuilder);

  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);

  readonly rows = computed(() => this.db.listStaffEnriched());

  readonly staffStats = computed(() => {
    const list = this.rows();
    let managers = 0;
    let accountants = 0;
    const br = new Set<string>();
    for (const r of list) {
      if (r.assignment.role === 'MANAGER') {
        managers += 1;
      }
      if (r.assignment.role === 'ACCOUNTANT') {
        accountants += 1;
      }
      br.add(r.branch.id);
    }
    return { total: list.length, managers, accountants, branches: br.size };
  });

  readonly paged = computed(() => {
    const list = this.rows();
    const start = this.pageIndex() * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.rows();
      this.pageSize();
      untracked(() => {
        const total = this.rows().length;
        const ps = this.pageSize();
        const max = Math.max(0, Math.ceil(total / ps) - 1);
        if (this.pageIndex() > max) {
          this.pageIndex.set(max);
        }
      });
    });
  }

  readonly allBranches = computed(() =>
    [...this.db.branches()].filter((b) => b.isActive).sort((a, b) => a.name.localeCompare(b.name)),
  );

  readonly inviteBranchOptions = computed((): MbSelectOption[] =>
    this.allBranches().map((b) => ({ value: b.id, label: b.name })),
  );

  readonly staffRoleOptions: MbSelectOption[] = [
    { value: 'MANAGER', label: 'Manager' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
  ];

  readonly staffMenuItems: MbActionMenuItem[] = [{ id: 'remove', label: 'Remove assignment', danger: true }];

  readonly inviteOpen = signal(false);
  readonly confirmRemove = signal(false);
  readonly removeTarget = signal<string | null>(null);

  readonly inviteForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', Validators.required],
    branchId: ['', Validators.required],
    role: this.fb.nonNullable.control<BranchStaffRole>('MANAGER'),
  });

  roleTone(role: BranchStaffRole): 'info' | 'success' | 'neutral' {
    if (role === 'MANAGER') {
      return 'info';
    }
    if (role === 'ACCOUNTANT') {
      return 'success';
    }
    return 'neutral';
  }

  openInvite(): void {
    const first = this.allBranches()[0]?.id ?? '';
    this.inviteForm.reset({
      email: '',
      fullName: '',
      branchId: first,
      role: 'MANAGER',
    });
    this.inviteOpen.set(true);
  }

  submitInvite(): void {
    if (this.inviteForm.invalid) {
      return;
    }
    const v = this.inviteForm.getRawValue();
    const existing = this.db.findUserByEmail(v.email);
    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      const u = this.db.createUser({
        email: v.email,
        fullName: v.fullName,
        isOwner: false,
        isActive: true,
      });
      userId = u.id;
    }
    try {
      this.db.assignStaff({ userId, branchId: v.branchId, role: v.role });
    } catch {
      /* duplicate role — ignore */
    }
    this.inviteOpen.set(false);
  }

  onStaffMenu(assignmentId: string, id: string): void {
    if (id === 'remove') {
      this.removeTarget.set(assignmentId);
      this.confirmRemove.set(true);
    }
  }

  doRemove(): void {
    const id = this.removeTarget();
    if (id) {
      this.db.removeStaffAssignment(id);
    }
    this.confirmRemove.set(false);
    this.removeTarget.set(null);
  }

  onPageSizeChange(n: number): void {
    this.pageSize.set(n);
    this.pageIndex.set(0);
  }
}
