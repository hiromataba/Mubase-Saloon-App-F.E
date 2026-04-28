import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Service } from '../../data/models/domain.types';
import { AuthService } from '../../core/auth/auth.service';
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
import { CurrencyService, type DisplayCurrencyCode } from '../../core/currency/currency.service';

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
        <h1 class="mb-page-title">Services</h1>
        <p class="mb-page-sub">Catalog by branch · pricing reference</p>
      </div>

      <mb-quick-stats-row lead>
        <mb-quick-stat-tile variant="violet" label="Services" [value]="'' + catalogStats().items" />
        <mb-quick-stat-tile variant="emerald" label="Active" [value]="'' + catalogStats().active" />
        <mb-quick-stat-tile variant="amber" label="Avg price" [value]="currency.format(catalogStats().avgPrice)" />
        <mb-quick-stat-tile variant="sky" label="Branches" [value]="'' + catalogStats().branches" />
      </mb-quick-stats-row>

      <div class="flex flex-col gap-5 py-2 md:gap-6 md:py-3">
        @for (group of groups(); track group.branch.id) {
          <mb-card
            [title]="group.branch.name"
            [subtitle]="group.branch.code + ' · ' + group.items.length + ' items'"
            [padding]="false"
          >
            @if (canManage()) {
              <div class="border-b border-slate-100 px-6 py-3 pb-4 dark:border-slate-800">
                <mb-btn size="sm" (click)="openAdd(group.branch.id)">Add service</mb-btn>
              </div>
            }
            <div class="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:p-8">
              @for (svc of group.items; track svc.id) {
                <div
                  class="relative flex flex-col rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30"
                >
                  @if (canManage()) {
                    <div class="absolute right-2 top-2">
                      <mb-action-menu [items]="serviceMenuItems" (picked)="onServiceMenu(svc, $event)" />
                    </div>
                  }
                  <div class="flex items-start justify-between gap-2 pr-8">
                    <p class="font-medium text-slate-900 dark:text-white">{{ svc.name }}</p>
                    <mb-badge [tone]="svc.isActive ? 'success' : 'neutral'">
                      {{ svc.isActive ? 'On' : 'Off' }}
                    </mb-badge>
                  </div>
                  @if (svc.description) {
                    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ svc.description }}</p>
                  }
                  <div class="mt-3 flex flex-wrap items-center gap-2">
                    <mb-badge tone="neutral" [caps]="false" class="!text-[10px]">{{
                      svc.priceCurrency === 'CDF' ? 'FC' : 'USD'
                    }}</mb-badge>
                    <p class="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {{ currency.format(svc.basePrice, svc.priceCurrency) }}
                    </p>
                  </div>
                  <p class="mt-1 text-xs text-slate-500">{{ svc.durationMin ? svc.durationMin + ' min' : '—' }}</p>
                </div>
              }
            </div>
          </mb-card>
        }
      </div>
    </div>

    <mb-modal
      [open]="formOpen()"
      [title]="editingId() ? 'Edit service' : 'Add service'"
      size="lg"
      (backdropClose)="closeForm()"
      (closeClick)="closeForm()"
    >
      <form class="space-y-4" [formGroup]="svcForm" (ngSubmit)="saveService()">
        <mb-field label="Name">
          <input class="mb-input" formControlName="name" />
        </mb-field>
        <mb-field label="Description">
          <input class="mb-input" formControlName="description" />
        </mb-field>
        <mb-field label="List price currency" [required]="true">
          <mb-select
            formControlName="priceCurrency"
            [options]="priceCurrencyOptions"
            placeholder="Currency"
          />
        </mb-field>
        <div class="grid gap-4 sm:grid-cols-2">
          <mb-field [label]="'Price (' + currency.amountLabelFor(svcCatalogMode()) + ')'">
            <input
              type="number"
              [attr.step]="currency.amountStepFor(svcCatalogMode())"
              min="0"
              class="mb-input tabular-nums"
              formControlName="basePrice"
            />
          </mb-field>
          <mb-field label="Duration (min)">
            <input type="number" min="0" class="mb-input tabular-nums" formControlName="durationMin" />
          </mb-field>
        </div>
        @if (editingId()) {
          <mb-field label="Status">
            <mb-select formControlName="isActive" [options]="activeStatusOptions" placeholder="Status" />
          </mb-field>
        }
        <div class="flex flex-wrap gap-2 pt-2">
          <mb-btn type="submit" [disabled]="svcForm.invalid">Save</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="closeForm()">Cancel</mb-btn>
        </div>
      </form>
    </mb-modal>

    <mb-confirm-dialog
      [open]="confirmOff()"
      title="Deactivate service?"
      message="It will be hidden from selectors; existing history remains."
      confirmLabel="Deactivate"
      [danger]="true"
      (confirm)="doDeactivateService()"
      (cancel)="confirmOff.set(false)"
    />
  `,
})
export class ServicesPageComponent {
  readonly auth = inject(AuthService);
  readonly currency = inject(CurrencyService);
  private readonly db = inject(MockDatabaseService);
  private readonly fb = inject(FormBuilder);

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

  readonly serviceMenuItems: MbActionMenuItem[] = [
    { id: 'edit', label: 'Edit' },
    { id: 'off', label: 'Deactivate', danger: true },
  ];

  readonly activeStatusOptions: MbSelectOption[] = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ];

  readonly priceCurrencyOptions: MbSelectOption[] = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'CDF', label: 'CDF (FC)' },
  ];

  readonly formOpen = signal(false);
  readonly branchTarget = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly confirmOff = signal(false);
  readonly offServiceId = signal<string | null>(null);

  readonly svcFormTick = signal(0);

  readonly svcForm = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    description: this.fb.nonNullable.control(''),
    priceCurrency: this.fb.nonNullable.control<'USD' | 'CDF'>('USD'),
    basePrice: this.fb.nonNullable.control(35, [Validators.required]),
    durationMin: this.fb.control<number | null>(30),
    isActive: this.fb.nonNullable.control<'true' | 'false'>('true'),
  });

  readonly svcCatalogMode = computed((): DisplayCurrencyCode => {
    this.svcFormTick();
    const pc = this.svcForm.getRawValue().priceCurrency;
    return pc === 'CDF' ? 'CDF' : 'USD';
  });

  private readonly destroyRef = inject(DestroyRef);

  private lastSvcCatalogMode: DisplayCurrencyCode | null = null;

  constructor() {
    this.svcForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.svcFormTick.update((n) => n + 1));

    effect(() => {
      const mode = this.svcCatalogMode();
      if (!this.formOpen()) {
        this.lastSvcCatalogMode = null;
        return;
      }
      const ctl = this.svcForm.get('basePrice');
      if (!ctl) {
        return;
      }
      if (this.lastSvcCatalogMode === null) {
        this.lastSvcCatalogMode = mode;
        return;
      }
      if (this.lastSvcCatalogMode === mode) {
        return;
      }
      const prev = this.lastSvcCatalogMode;
      this.lastSvcCatalogMode = mode;
      const v = Number(ctl.value) || 0;
      const usd = this.currency.usdFromDisplayAmount(v, prev);
      const next = this.currency.displayAmountFromUsd(usd, mode);
      ctl.setValue(next, { emitEvent: false });
    });
  }

  openAdd(branchId: string): void {
    this.branchTarget.set(branchId);
    this.editingId.set(null);
    this.lastSvcCatalogMode = null;
    this.svcForm.reset({
      name: '',
      description: '',
      priceCurrency: 'USD',
      basePrice: this.currency.displayAmountFromUsd(35, 'USD'),
      durationMin: 30,
      isActive: 'true',
    });
    this.svcForm.get('basePrice')?.setValidators([
      Validators.required,
      this.currency.minUsdAmountValidator(() => this.svcCatalogMode()),
    ]);
    this.svcForm.get('basePrice')?.updateValueAndValidity({ emitEvent: false });
    this.formOpen.set(true);
  }

  onServiceMenu(svc: Service, id: string): void {
    if (id === 'edit') {
      this.branchTarget.set(svc.branchId);
      this.editingId.set(svc.id);
      const pc = svc.priceCurrency ?? 'USD';
      this.lastSvcCatalogMode = null;
      this.svcForm.patchValue({
        name: svc.name,
        description: svc.description ?? '',
        priceCurrency: pc,
        basePrice: this.currency.displayAmountFromUsd(svc.basePrice, pc),
        durationMin: svc.durationMin ?? null,
        isActive: svc.isActive ? 'true' : 'false',
      });
      this.svcForm.get('basePrice')?.setValidators([
        Validators.required,
        this.currency.minUsdAmountValidator(() => this.svcCatalogMode()),
      ]);
      this.svcForm.get('basePrice')?.updateValueAndValidity({ emitEvent: false });
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
      priceCurrency: 'USD' | 'CDF';
      basePrice: number;
      durationMin: number | null;
      isActive: 'true' | 'false';
    };
    const branchId = this.branchTarget();
    if (!branchId) {
      return;
    }
    const mode = v.priceCurrency === 'CDF' ? 'CDF' : 'USD';
    const basePriceUsd = this.currency.usdFromDisplayAmount(v.basePrice, mode);
    if (this.editingId()) {
      this.db.updateService(this.editingId()!, {
        name: v.name,
        description: v.description || null,
        priceCurrency: mode,
        basePrice: basePriceUsd,
        durationMin: v.durationMin ?? null,
        isActive: v.isActive === 'true',
      });
    } else {
      this.db.createService({
        branchId,
        name: v.name,
        description: v.description || null,
        priceCurrency: mode,
        basePrice: basePriceUsd,
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
