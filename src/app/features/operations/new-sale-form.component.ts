import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import type { TransactionListItem } from '../../data/models/domain.types';
import { splitEarnings } from '../../data/mock/earnings.util';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { formatPct, formatUsd } from '../../shared/formatters';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbFieldComponent } from '../../shared/ui/mb-field.component';
import { MbPhoneInputComponent } from '../../shared/ui/mb-phone-input.component';
import { MbSelectComponent, type MbSelectOption } from '../../shared/ui/mb-select.component';

@Component({
  standalone: true,
  selector: 'app-new-sale-form',
  imports: [
    ReactiveFormsModule,
    MbFieldComponent,
    MbButtonComponent,
    MbBadgeComponent,
    MbSelectComponent,
    MbPhoneInputComponent,
  ],
  template: `
    <form class="space-y-8" [formGroup]="form" (ngSubmit)="submit()">
      <div
        class="rounded-2xl border border-mb-border bg-mb-elevated/20 p-5 shadow-mb-card sm:p-6 dark:bg-mb-elevated/25 dark:shadow-mb-card-dark"
      >
        <p class="mb-section-label">Sale</p>
        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <mb-field label="Branch" [required]="true">
            <mb-select formControlName="branchId" [options]="branchSelectOptions()" placeholder="Choose branch" />
          </mb-field>
          <mb-field label="Barber" [required]="true">
            <mb-select
              formControlName="barberProfileId"
              [options]="barberSelectOptions()"
              placeholder="Choose barber"
            />
          </mb-field>
          <mb-field label="Service" hint="Price loads from catalog — editable" [optional]="true">
            <mb-select formControlName="serviceId" [options]="serviceSelectOptions()" placeholder="Custom / walk-in" />
          </mb-field>
          <mb-field label="Amount (USD)" [required]="true">
            <input type="number" step="0.01" min="0" formControlName="totalAmount" class="mb-input tabular-nums" />
          </mb-field>
        </div>
      </div>

      <div
        class="rounded-2xl border border-mb-border bg-mb-elevated/20 p-5 shadow-mb-card sm:p-6 dark:bg-mb-elevated/25 dark:shadow-mb-card-dark"
      >
        <p class="mb-section-label">Customer</p>
        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <mb-field
            label="Existing customer"
            hint="Pick someone already on file, or leave empty to create from the fields below"
            [optional]="true"
          >
            <mb-select
              formControlName="customerId"
              [options]="customerSelectOptions()"
              placeholder="New customer — use name below"
            />
          </mb-field>
          <mb-field
            label="Display name"
            hint="On receipt; if nobody is selected above, we save this person for this branch"
            [required]="true"
          >
            <input formControlName="customerName" class="mb-input" />
          </mb-field>
          <mb-field label="WhatsApp number" hint="Optional — for receipts and follow-up" [optional]="true">
            <mb-phone-input formControlName="customerWhatsapp" />
          </mb-field>
        </div>
      </div>

      <div
        class="rounded-2xl border border-mb-border bg-[var(--mb-primary-soft)] p-5 shadow-mb-card ring-1 ring-inset ring-[color-mix(in_srgb,var(--mb-primary)_18%,transparent)] sm:p-6 dark:shadow-mb-card-dark"
      >
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-mb-border pb-4">
          <p class="mb-section-label font-semibold text-mb-primary">Checkout summary</p>
          <mb-badge tone="info" [caps]="false">Live split</mb-badge>
        </div>
        <dl class="mt-6 grid gap-4 sm:grid-cols-3 sm:mt-7">
          <div class="rounded-xl border border-mb-border bg-mb-surface px-4 py-3.5 shadow-sm dark:bg-mb-bg">
            <dt class="text-xs font-medium text-mb-text-secondary">Barber %</dt>
            <dd class="mt-1 font-display text-lg font-semibold tabular-nums text-mb-text-primary">
              {{ formatPct(preview().pct) }}
            </dd>
          </div>
          <div class="rounded-xl border border-mb-border bg-mb-surface px-4 py-3.5 shadow-sm dark:bg-mb-bg">
            <dt class="text-xs font-medium text-mb-text-secondary">Barber earns</dt>
            <dd class="mt-1 font-display text-lg font-semibold tabular-nums text-mb-primary">
              {{ formatUsd(preview().barber) }}
            </dd>
          </div>
          <div class="rounded-xl border border-mb-border bg-mb-surface px-4 py-3.5 shadow-sm dark:bg-mb-bg">
            <dt class="text-xs font-medium text-mb-text-secondary">Shop earns</dt>
            <dd class="mt-1 font-display text-lg font-semibold tabular-nums text-mb-text-primary">
              {{ formatUsd(preview().shop) }}
            </dd>
          </div>
        </dl>
        <div class="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <mb-field label="Payment method" [required]="true">
            <mb-select
              class="sm:w-44"
              formControlName="paymentMethod"
              [options]="paymentMethodOptions"
              placeholder="Payment"
            />
          </mb-field>
        </div>
        <div class="mt-6 flex flex-wrap gap-3 border-t border-mb-border pt-6">
          <mb-btn type="submit" [disabled]="form.invalid">Post payment</mb-btn>
          <mb-btn type="button" variant="secondary" (click)="resetForm()">Reset</mb-btn>
        </div>
      </div>
    </form>
  `,
})
export class NewSaleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly db = inject(MockDatabaseService);

  readonly saved = output<TransactionListItem>();

  readonly formatUsd = formatUsd;
  readonly formatPct = formatPct;

  readonly branches = computed(() => {
    const u = this.auth.currentUser();
    return u ? this.db.listBranchesVisibleTo(u) : [];
  });

  readonly branchSelectOptions = computed(() =>
    this.branches().map((b) => ({ value: b.id, label: b.name })),
  );

  readonly barberSelectOptions = computed(() =>
    this.barbersForBranch().map((bar) => ({
      value: bar.id,
      label: `${bar.displayName} · ${this.formatPct(bar.commissionPercent)}`,
    })),
  );

  readonly serviceSelectOptions = computed(() => [
    { value: '', label: 'Custom / walk-in' },
    ...this.servicesForBranch().map((s) => ({
      value: s.id,
      label: `${s.name} — ${this.formatUsd(s.basePrice)}`,
    })),
  ]);

  readonly customerSelectOptions = computed(() => [
    { value: '', label: 'Not on list — new or walk-in' },
    ...this.customersForBranch().map((c) => ({ value: c.id, label: c.fullName })),
  ]);

  readonly paymentMethodOptions: MbSelectOption[] = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Card' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'OTHER', label: 'Other' },
  ];

  readonly branchIdSig = signal<string>('');

  readonly barbersForBranch = computed(() => {
    const id = this.branchIdSig();
    return id ? this.db.listBarbersForBranch(id) : [];
  });

  readonly servicesForBranch = computed(() => {
    const id = this.branchIdSig();
    return id ? this.db.listServicesForBranch(id) : [];
  });

  readonly customersForBranch = computed(() => {
    const id = this.branchIdSig();
    return id ? this.db.listCustomersForBranch(id) : [];
  });

  private readonly previewTick = signal(0);

  readonly preview = computed(() => {
    this.previewTick();
    const v = this.form.getRawValue();
    const total = Number(v.totalAmount) || 0;
    const barber = v.barberProfileId ? this.db.getBarber(v.barberProfileId) : undefined;
    const pct = barber?.commissionPercent ?? 0;
    const { barberEarning, shopEarning } = splitEarnings(total, pct);
    return { pct, barber: barberEarning, shop: shopEarning };
  });

  readonly form = this.fb.nonNullable.group({
    branchId: ['', Validators.required],
    barberProfileId: ['', Validators.required],
    serviceId: [''],
    totalAmount: [0, [Validators.required, Validators.min(0.01)]],
    customerId: [''],
    customerName: ['Walk-in', Validators.required],
    customerWhatsapp: [''],
    paymentMethod: this.fb.nonNullable.control<'CASH' | 'CARD' | 'TRANSFER' | 'OTHER'>('CASH'),
  });

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => this.previewTick.update((n) => n + 1));

    const first = this.branches()[0]?.id ?? '';
    this.form.patchValue({ branchId: first });
    this.branchIdSig.set(first);

    this.form.get('branchId')?.valueChanges.subscribe((id) => {
      this.branchIdSig.set(id);
      const barbers = this.db.listBarbersForBranch(id);
      this.form.patchValue({
        barberProfileId: barbers[0]?.id ?? '',
        serviceId: '',
        customerId: '',
      });
    });

    this.form.get('serviceId')?.valueChanges.subscribe((sid) => {
      if (!sid) {
        return;
      }
      const svc = this.db.getService(sid);
      if (svc) {
        this.form.patchValue({ totalAmount: svc.basePrice });
      }
    });

    this.form.get('customerId')?.valueChanges.subscribe((cid) => {
      if (!cid) {
        return;
      }
      const list = this.customersForBranch();
      const c = list.find((x) => x.id === cid);
      if (c) {
        this.form.patchValue({
          customerName: c.fullName,
          customerWhatsapp: c.whatsapp ?? c.phone ?? '',
        });
      }
    });

    const barbers = this.db.listBarbersForBranch(first);
    this.form.patchValue({ barberProfileId: barbers[0]?.id ?? '' });
    this.previewTick.update((n) => n + 1);
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    const barber = this.db.getBarber(v.barberProfileId);
    const svc = v.serviceId ? this.db.getService(v.serviceId) : undefined;
    const u = this.auth.currentUser();
    if (!barber || !u) {
      return;
    }
    const waTrim = v.customerWhatsapp?.trim() || '';
    const customerId = this.resolveCustomerIdForCheckout(
      v.branchId,
      v.customerId,
      v.customerName,
      waTrim,
    );
    const row = this.db.recordTransaction({
      branchId: v.branchId,
      barberProfileId: v.barberProfileId,
      serviceId: v.serviceId || null,
      customerId,
      customerName: v.customerName.trim(),
      customerWhatsapp: waTrim || undefined,
      serviceName: svc?.name ?? 'Custom service',
      totalAmount: v.totalAmount,
      commissionPercent: barber.commissionPercent,
      paymentMethod: v.paymentMethod,
      recordedByUserId: u.id,
    });
    this.saved.emit(row);
    this.resetForm();
  }

  /**
   * - Customer chosen in the dropdown → use that id.
   * - No selection + anonymous walk-in (default name, no WhatsApp) → no customer record.
   * - No selection + any real details → create a customer for this branch, then link the sale.
   */
  private resolveCustomerIdForCheckout(
    branchId: string,
    selectedCustomerId: string,
    displayName: string,
    whatsappTrimmed: string,
  ): string | null {
    const picked = selectedCustomerId?.trim();
    if (picked) {
      return picked;
    }
    const name = displayName.trim();
    const hasWhatsapp = whatsappTrimmed.replace(/\D/g, '').length > 0;
    const anonymousWalkIn = name.toLowerCase() === 'walk-in' && !hasWhatsapp;
    if (anonymousWalkIn || !name) {
      return null;
    }
    const created = this.db.createCustomer({
      branchId,
      fullName: name,
      phone: null,
      whatsapp: hasWhatsapp ? whatsappTrimmed : null,
    });
    return created.id;
  }

  resetForm(): void {
    const branchId = this.form.get('branchId')?.value ?? this.branches()[0]?.id ?? '';
    const barbers = this.db.listBarbersForBranch(branchId);
    this.form.reset({
      branchId,
      barberProfileId: barbers[0]?.id ?? '',
      serviceId: '',
      totalAmount: 0,
      customerId: '',
      customerName: 'Walk-in',
      customerWhatsapp: '',
      paymentMethod: 'CASH',
    });
  }
}
