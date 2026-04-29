import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import type { BarberProfile, OwnerDashboardBarberRow } from '../../data/models/domain.types';
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
          <h1 class="mb-page-title">{{ i18n.t('page.barbers.title') }}</h1>
          <p class="mb-page-sub">{{ i18n.t('page.barbers.subtitle') }}</p>
        </div>
        <div class="mb-toolbar w-full max-w-xl sm:flex-1 sm:justify-end">
          <input
            type="search"
            class="mb-input min-w-0 flex-1"
            [attr.placeholder]="i18n.t('page.barbers.searchPlaceholder')"
            [value]="query()"
            (input)="onQueryInput($event)"
          />
          @if (auth.canManageBarbers()) {
            <mb-btn (click)="openCreate()">{{ i18n.t('page.barbers.modalCreate') }}</mb-btn>
          }
        </div>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" [label]="i18n.t('page.barbers.statBarbers')" [value]="'' + barberStats().total" [hint]="i18n.t('page.barbers.statInViewHint')" />
        <mb-quick-stat-tile variant="emerald" [label]="i18n.t('page.barbers.statActive')" [value]="'' + barberStats().active" />
        <mb-quick-stat-tile
          variant="amber"
          [label]="i18n.t('page.barbers.statGrossServices')"
          [value]="formatUsd(barberStats().gross)"
        />
        <mb-quick-stat-tile
          variant="sky"
          [label]="i18n.t('page.barbers.statBarberPayouts')"
          [value]="formatUsd(barberStats().earned)"
        />
      </mb-quick-stats-row>

      <mb-card [title]="i18n.t('page.barbers.rosterTitleLead') + ' (' + filtered().length + ')'" [subtitle]="i18n.t('page.barbers.rosterSubtitle')" [padding]="false">
        <div class="mb-table-wrap hidden lg:block">
          <table class="w-full min-w-[760px]">
            <thead>
              <tr class="mb-table-head">
                <th>{{ i18n.t('page.barbers.thBarber') }}</th>
                <th>{{ i18n.t('page.barbers.thBranch') }}</th>
                <th>{{ i18n.t('page.barbers.thSplit') }}</th>
                <th class="text-right">{{ i18n.t('page.barbers.thServices') }}</th>
                <th class="text-right">{{ i18n.t('page.barbers.thGross') }}</th>
                <th class="text-right">{{ i18n.t('page.barbers.thEarned') }}</th>
                <th>{{ i18n.t('page.barbers.fieldStatus') }}</th>
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
                      {{ row.barber.isActive ? i18n.t('page.branches.statusActive') : i18n.t('page.barbers.badgeOff') }}
                    </mb-badge>
                  </td>
                  <td class="mb-table-cell text-right">
                    <mb-action-menu [items]="barberMenuItems()" (picked)="onBarberMenu(row, $event)" />
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
                <mb-action-menu [items]="barberMenuItems()" (picked)="onBarberMenu(row, $event)" />
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <mb-badge tone="success" [caps]="false">{{ formatPct(row.barber.commissionPercent) }}</mb-badge>
                <mb-badge [tone]="row.barber.isActive ? 'success' : 'neutral'" [caps]="false">
                  {{ row.barber.isActive ? i18n.t('page.branches.statusActive') : i18n.t('page.branches.statusInactive') }}
                </mb-badge>
              </div>
              <dl class="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt class="text-slate-500">{{ i18n.t('page.barbers.dlServices') }}</dt>
                  <dd class="font-semibold">{{ row.servicesCount }}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">{{ i18n.t('page.barbers.dlGross') }}</dt>
                  <dd class="font-semibold tabular-nums">{{ formatUsd(row.revenue) }}</dd>
                </div>
                <div>
                  <dt class="text-slate-500">{{ i18n.t('page.barbers.dlEarned') }}</dt>
                  <dd class="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {{ formatUsd(row.barberEarnings) }}
                  </dd>
                </div>
              </dl>
            </div>
          }
          @if (filtered().length === 0) {
            <p class="py-8 text-center text-sm text-slate-500">{{ i18n.t('page.barbers.emptyMatch') }}</p>
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
      [title]="creating() ? i18n.t('page.barbers.modalCreate') : i18n.t('page.barbers.modalEdit')"
      size="lg"
      (backdropClose)="closeForm()"
      (closeClick)="closeForm()"
    >
      <form class="space-y-4" [formGroup]="barberForm" (ngSubmit)="saveBarber()">
        @if (formError()) {
          <p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{{ formError() }}</p>
        }
        @if (creating()) {
          <mb-field [label]="i18n.t('page.barbers.fieldWorkEmail')" [hint]="i18n.t('page.barbers.fieldWorkEmailHint')">
            <input type="email" class="mb-input" formControlName="email" autocomplete="off" />
          </mb-field>
          <mb-field [label]="i18n.t('page.barbers.fieldFullName')">
            <input class="mb-input" formControlName="fullName" />
          </mb-field>
          <mb-field [label]="i18n.t('page.barbers.fieldPasswordCreate')">
            <input type="password" class="mb-input" formControlName="password" autocomplete="new-password" />
          </mb-field>
          <mb-field [label]="i18n.t('page.barbers.fieldPasswordConfirm')">
            <input type="password" class="mb-input" formControlName="passwordConfirm" autocomplete="new-password" />
          </mb-field>
        } @else {
          <p class="text-xs font-semibold uppercase tracking-wide text-mb-text-secondary">
            {{ i18n.t('page.barbers.accountSection') }}
          </p>
          <mb-field [label]="i18n.t('page.barbers.fieldWorkEmail')">
            <input type="email" class="mb-input" formControlName="email" autocomplete="email" />
          </mb-field>
          <mb-field [label]="i18n.t('page.barbers.fieldFullName')">
            <input class="mb-input" formControlName="fullName" />
          </mb-field>
          <mb-field [label]="i18n.t('page.staff.fieldNewPassword')" [hint]="i18n.t('page.barbers.changePasswordHint')">
            <input type="password" class="mb-input" formControlName="newPassword" autocomplete="new-password" />
          </mb-field>
          <mb-field [label]="i18n.t('page.barbers.fieldPasswordConfirm')">
            <input type="password" class="mb-input" formControlName="newPasswordConfirm" autocomplete="new-password" />
          </mb-field>
        }
        <mb-field [label]="i18n.t('page.barbers.fieldDisplayName')">
          <input class="mb-input" formControlName="displayName" />
        </mb-field>
        <mb-field [label]="i18n.t('page.barbers.fieldBranch')">
          <mb-select
            formControlName="branchId"
            [options]="barberBranchOptions()"
            [placeholder]="i18n.t('page.barbers.placeholderBranch')"
          />
        </mb-field>
        <mb-field [label]="i18n.t('page.barbers.fieldCommission')" [hint]="i18n.t('page.barbers.fieldCommissionHint')">
          <input type="number" min="0" max="100" class="mb-input tabular-nums" formControlName="commissionPercent" />
        </mb-field>
        @if (!creating()) {
          <mb-field [label]="i18n.t('page.barbers.fieldStatus')">
            <mb-select formControlName="isActive" [options]="activeStatusOptions()" [placeholder]="i18n.t('page.barbers.placeholderStatus')" />
          </mb-field>
        }
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="barberForm.invalid">{{ i18n.t('common.save') }}</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="closeForm()">{{ i18n.t('common.cancel') }}</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmOff()"
      [title]="i18n.t('page.barbers.confirmOffTitle')"
      [message]="i18n.t('page.barbers.confirmOffMessage')"
      [confirmLabel]="i18n.t('common.deactivate')"
      [danger]="true"
      (confirm)="doDeactivate()"
      (cancel)="confirmOff.set(false)"
    />
  `,
})
export class BarbersPageComponent {
  readonly auth = inject(AuthService);
  readonly db = inject(MockDatabaseService);
  readonly i18n = inject(I18nService);
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

  readonly activeStatusOptions = computed((): MbSelectOption[] => [
    { value: 'true', label: this.i18n.t('page.branches.statusActive') },
    { value: 'false', label: this.i18n.t('page.branches.statusInactive') },
  ]);

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

  readonly barberMenuItems = computed((): MbActionMenuItem[] => {
    const i = this.i18n;
    if (this.auth.canManageBarbers()) {
      return [
        { id: 'perf', label: i.t('actionMenu.viewPerformance') },
        { id: 'edit', label: i.t('actionMenu.editBarber') },
        { id: 'off', label: i.t('actionMenu.deactivate'), danger: true },
      ];
    }
    return [{ id: 'perf', label: i.t('actionMenu.viewPerformance') }];
  });

  readonly formOpen = signal(false);
  readonly formError = signal<string | null>(null);
  readonly creating = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly editingBarberUserId = signal<string | null>(null);
  readonly confirmOff = signal(false);
  readonly offTarget = signal<string | null>(null);

  readonly barberForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', Validators.required],
    displayName: ['', Validators.required],
    branchId: ['', Validators.required],
    commissionPercent: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
    isActive: this.fb.nonNullable.control<'true' | 'false'>('true'),
    password: [''],
    passwordConfirm: [''],
    newPassword: [''],
    newPasswordConfirm: [''],
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
    this.editingBarberUserId.set(null);
    this.formError.set(null);
    const first = this.branches()[0]?.id ?? '';
    this.barberForm.reset({
      email: '',
      fullName: '',
      displayName: '',
      branchId: first,
      commissionPercent: 60,
      isActive: 'true',
      password: '',
      passwordConfirm: '',
      newPassword: '',
      newPasswordConfirm: '',
    });
    this.formOpen.set(true);
  }

  openEdit(b: BarberProfile): void {
    this.creating.set(false);
    this.editingId.set(b.id);
    this.editingBarberUserId.set(b.userId);
    this.formError.set(null);
    const usr = this.db.getUserById(b.userId);
    this.barberForm.reset({
      email: usr?.email ?? '',
      fullName: usr?.fullName ?? '',
      displayName: b.displayName,
      branchId: b.branchId,
      commissionPercent: b.commissionPercent,
      isActive: b.isActive ? 'true' : 'false',
      password: '',
      passwordConfirm: '',
      newPassword: '',
      newPasswordConfirm: '',
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.formError.set(null);
  }

  saveBarber(): void {
    this.formError.set(null);
    if (this.barberForm.invalid) {
      return;
    }
    const v = this.barberForm.getRawValue();
    const i = this.i18n;
    if (this.creating()) {
      const pw = v.password.trim();
      const pc = v.passwordConfirm.trim();
      if (pw.length < 8) {
        this.formError.set(i.t('validation.passwordMin8'));
        return;
      }
      if (pw !== pc) {
        this.formError.set(i.t('validation.passwordMismatch'));
        return;
      }
      if (this.db.isEmailTaken(v.email)) {
        this.formError.set(i.t('validation.emailTaken'));
        return;
      }
      this.db.createBarberAccount({
        email: v.email.trim(),
        fullName: v.fullName.trim(),
        password: pw,
        branchId: v.branchId,
        displayName: v.displayName.trim(),
        commissionPercent: v.commissionPercent,
      });
    } else {
      const barberId = this.editingId();
      const uid = this.editingBarberUserId();
      if (!barberId || !uid) {
        return;
      }
      if (this.db.isEmailTaken(v.email, uid)) {
        this.formError.set(i.t('validation.emailTaken'));
        return;
      }
      this.db.updateUser(uid, {
        email: v.email.trim(),
        fullName: v.fullName.trim(),
      });
      const np = v.newPassword.trim();
      const npc = v.newPasswordConfirm.trim();
      if (np.length > 0 || npc.length > 0) {
        if (np.length < 8) {
          this.formError.set(i.t('validation.passwordMin8'));
          return;
        }
        if (np !== npc) {
          this.formError.set(i.t('validation.passwordMismatch'));
          return;
        }
        this.db.setLoginPassword(uid, np);
      }
      this.db.updateBarberProfile(barberId, {
        displayName: v.displayName.trim(),
        branchId: v.branchId,
        commissionPercent: v.commissionPercent,
        isActive: v.isActive === 'true',
      });
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
