import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Service } from '../../data/models/domain.types';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/locale/i18n.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { MbActionMenuComponent, type MbActionMenuItem } from '../../shared/ui/mb-action-menu.component';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';
import { MbConfirmDialogComponent } from '../../shared/ui/mb-confirm-dialog.component';
import { MbFieldComponent } from '../../shared/ui/mb-field.component';
import { MbSelectComponent, type MbSelectOption } from '../../shared/ui/mb-select.component';
import { MbModalComponent } from '../../shared/ui/mb-modal.component';
import { MbQuickStatTileComponent } from '../../shared/ui/mb-quick-stat-tile.component';
import { MbQuickStatsRowComponent } from '../../shared/ui/mb-quick-stats-row.component';
import { formatUsd } from '../../shared/formatters';

@Component({
  standalone: true,
  selector: 'app-services-page',
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
  ],
  template: `
    <div class="mx-auto max-w-7xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header">
        <h1 class="mb-page-title">{{ i18n.t('page.services.title') }}</h1>
        <p class="mb-page-sub">{{ i18n.t('page.services.subtitle') }}</p>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" [label]="i18n.t('page.services.statItems')" [value]="'' + catalogStats().items" />
        <mb-quick-stat-tile variant="emerald" [label]="i18n.t('page.services.statActiveCount')" [value]="'' + catalogStats().active" />
        <mb-quick-stat-tile variant="amber" [label]="i18n.t('page.services.statAvgPrice')" [value]="formatUsd(catalogStats().avgPrice)" />
        <mb-quick-stat-tile variant="sky" [label]="i18n.t('page.services.statBranches')" [value]="'' + catalogStats().branches" />
      </mb-quick-stats-row>

      <div class="flex flex-col gap-5 py-2 md:gap-6 md:py-3">
        @for (group of groups(); track group.branch.id) {
          <mb-card
            [title]="group.branch.name"
            [subtitle]="group.branch.code + ' · ' + group.items.length + ' ' + i18n.t('page.services.itemsCount')"
            [padding]="false"
          >
            @if (canManage()) {
              <div class="border-b border-slate-100 px-6 py-3 pb-4 dark:border-slate-800">
                <mb-btn size="sm" (click)="openAdd(group.branch.id)">{{ i18n.t('page.services.addInline') }}</mb-btn>
              </div>
            }
            <div class="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:p-8">
              @for (svc of group.items; track svc.id) {
                <div
                  class="relative flex flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30"
                >
                  @if (canManage()) {
                    <div class="absolute right-2 top-2">
                      <mb-action-menu [items]="serviceMenuItems()" (picked)="onServiceMenu(svc, $event)" />
                    </div>
                  }
                  <div class="flex items-start justify-between gap-2 pr-8">
                    <p class="font-medium text-slate-900 dark:text-white">{{ svc.name }}</p>
                    <mb-badge [tone]="svc.isActive ? 'success' : 'neutral'">
                      {{ svc.isActive ? i18n.t('page.services.catalogOn') : i18n.t('page.services.catalogOff') }}
                    </mb-badge>
                  </div>
                  @if (svc.description) {
                    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ svc.description }}</p>
                  }
                  <p class="mt-3 text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {{ formatUsd(svc.basePrice) }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">{{ svc.durationMin ? svc.durationMin + ' ' + i18n.t('common.minAbbrev') : '—' }}</p>
                </div>
              }
            </div>
          </mb-card>
        }
      </div>
    </div>

    <mb-modal
      [open]="formOpen()"
      [title]="editingId() ? i18n.t('page.services.modalEdit') : i18n.t('page.services.modalAdd')"
      size="lg"
      (backdropClose)="closeForm()"
      (closeClick)="closeForm()"
    >
      <form class="space-y-4" [formGroup]="svcForm" (ngSubmit)="saveService()">
        <mb-field [label]="i18n.t('page.services.fieldName')">
          <input class="mb-input" formControlName="name" />
        </mb-field>
        <mb-field [label]="i18n.t('page.services.fieldDescription')">
          <input class="mb-input" formControlName="description" />
        </mb-field>
        <div class="grid gap-4 sm:grid-cols-2">
          <mb-field [label]="i18n.t('page.services.fieldPriceUsd')">
            <input type="number" step="0.01" min="0" class="mb-input tabular-nums" formControlName="basePrice" />
          </mb-field>
          <mb-field [label]="i18n.t('page.services.fieldDuration')">
            <input type="number" min="0" class="mb-input tabular-nums" formControlName="durationMin" />
          </mb-field>
        </div>
        @if (editingId()) {
          <mb-field [label]="i18n.t('page.services.fieldStatus')">
            <mb-select formControlName="isActive" [options]="activeStatusOptions()" [placeholder]="i18n.t('page.services.placeholderStatus')" />
          </mb-field>
        }
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="svcForm.invalid">{{ i18n.t('common.save') }}</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="closeForm()">{{ i18n.t('common.cancel') }}</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmOff()"
      [title]="i18n.t('page.services.confirmOffTitle')"
      [message]="i18n.t('page.services.confirmOffMessage')"
      [confirmLabel]="i18n.t('common.deactivate')"
      [danger]="true"
      (confirm)="doDeactivateService()"
      (cancel)="confirmOff.set(false)"
    />
  `,
})
export class ServicesPageComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly db = inject(MockDatabaseService);
  private readonly fb = inject(FormBuilder);

  readonly formatUsd = formatUsd;

  readonly canManage = computed(() => this.auth.canManageBusiness());

  readonly groups = computed(() => {
    const u = this.auth.currentUser();
    const branches = u ? this.db.listBranchesVisibleTo(u) : [];
    return branches.map((branch) => ({
      branch,
      items: this.db.listServicesForBranchAll(branch.id),
    }));
  });

  readonly catalogStats = computed(() => {
    const groups = this.groups();
    let items = 0;
    let active = 0;
    let sum = 0;
    for (const g of groups) {
      for (const s of g.items) {
        items += 1;
        if (s.isActive) {
          active += 1;
        }
        sum += s.basePrice;
      }
    }
    const avgPrice = items ? sum / items : 0;
    return { items, active, avgPrice, branches: groups.length };
  });

  readonly serviceMenuItems = computed((): MbActionMenuItem[] => [
    { id: 'edit', label: this.i18n.t('actionMenu.edit') },
    { id: 'off', label: this.i18n.t('actionMenu.deactivate'), danger: true },
  ]);

  readonly activeStatusOptions = computed((): MbSelectOption[] => [
    { value: 'true', label: this.i18n.t('page.branches.statusActive') },
    { value: 'false', label: this.i18n.t('page.branches.statusInactive') },
  ]);

  readonly formOpen = signal(false);
  readonly branchTarget = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly confirmOff = signal(false);
  readonly offServiceId = signal<string | null>(null);

  readonly svcForm = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.nonNullable.control(''),
    basePrice: this.fb.nonNullable.control(35, [Validators.required, Validators.min(0.01)]),
    durationMin: this.fb.control<number | null>(30),
    isActive: this.fb.nonNullable.control<'true' | 'false'>('true'),
  });

  openAdd(branchId: string): void {
    this.branchTarget.set(branchId);
    this.editingId.set(null);
    this.svcForm.reset({
      name: '',
      description: '',
      basePrice: 35,
      durationMin: 30,
      isActive: 'true',
    });
    this.formOpen.set(true);
  }

  onServiceMenu(svc: Service, id: string): void {
    if (id === 'edit') {
      this.branchTarget.set(svc.branchId);
      this.editingId.set(svc.id);
      this.svcForm.patchValue({
        name: svc.name,
        description: svc.description ?? '',
        basePrice: svc.basePrice,
        durationMin: svc.durationMin ?? null,
        isActive: svc.isActive ? 'true' : 'false',
      });
      this.formOpen.set(true);
    }
    if (id === 'off') {
      this.offServiceId.set(svc.id);
      this.confirmOff.set(true);
    }
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  saveService(): void {
    if (this.svcForm.invalid) {
      return;
    }
    const v = this.svcForm.getRawValue() as {
      name: string;
      description: string;
      basePrice: number;
      durationMin: number | null;
      isActive: 'true' | 'false';
    };
    const branchId = this.branchTarget();
    if (!branchId) {
      return;
    }
    if (this.editingId()) {
      this.db.updateService(this.editingId()!, {
        name: v.name,
        description: v.description || null,
        basePrice: v.basePrice,
        durationMin: v.durationMin ?? null,
        isActive: v.isActive === 'true',
      });
    } else {
      this.db.createService({
        branchId,
        name: v.name,
        description: v.description || null,
        basePrice: v.basePrice,
        durationMin: v.durationMin ?? null,
        isActive: true,
      });
    }
    this.closeForm();
  }

  doDeactivateService(): void {
    const id = this.offServiceId();
    if (id) {
      this.db.setServiceActive(id, false);
    }
    this.confirmOff.set(false);
    this.offServiceId.set(null);
  }
}
