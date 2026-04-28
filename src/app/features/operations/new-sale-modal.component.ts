import { Component, effect, inject, signal } from '@angular/core';
import type { TransactionListItem } from '../../data/models/domain.types';
import { CurrencyService } from '../../core/currency/currency.service';
import { formatDateTime, formatPct } from '../../shared/formatters';
import { buildReceiptThankYouMessage, openWhatsAppPrefilled } from '../../shared/whatsapp.util';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbModalComponent } from '../../shared/ui/mb-modal.component';
import { NewSaleFormComponent } from './new-sale-form.component';
import { NewSaleModalService } from './new-sale-modal.service';

@Component({
  standalone: true,
  selector: 'app-new-sale-modal',
  imports: [MbModalComponent, MbButtonComponent, MbBadgeComponent, NewSaleFormComponent],
  template: `
    <mb-modal
      [open]="saleModal.open()"
      title="New sale"
      description="Front desk · mock ledger updates instantly"
      size="wide"
      (backdropClose)="close()"
      (closeClick)="close()"
    >
      @if (lastSale(); as sale) {
        <div class="space-y-8">
          <div
            class="rounded-2xl border border-mb-border bg-[var(--mb-primary-soft)] p-5 shadow-mb-card ring-1 ring-inset ring-[color-mix(in_srgb,var(--mb-primary)_20%,transparent)] dark:shadow-mb-card-dark"
          >
            <p class="text-sm font-semibold text-mb-primary">Payment recorded</p>
            <p class="mt-1 text-sm font-normal text-mb-text-primary">
              {{ sale.customerNameSnapshot }} · {{ currency.format(sale.totalAmount) }}
            </p>
            <dl class="mt-4 grid gap-3 border-t border-mb-border pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt class="text-xs text-mb-text-secondary">Barber payout</dt>
                <dd class="mt-0.5 font-semibold tabular-nums text-mb-primary">{{ currency.format(sale.barberEarning) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-mb-text-secondary">Shop share</dt>
                <dd class="mt-0.5 font-semibold tabular-nums text-mb-text-primary">{{ currency.format(sale.shopEarning) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-mb-text-secondary">Commission</dt>
                <dd class="mt-0.5 font-semibold tabular-nums text-mb-text-primary">{{ formatPct(sale.commissionPercentSnapshot) }}</dd>
              </div>
            </dl>
          </div>
          <div
            class="rounded-2xl border border-mb-border bg-mb-elevated/25 p-5 shadow-inner dark:bg-mb-elevated/20 sm:p-6"
          >
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-mb-border pb-4">
              <div>
                <p class="font-display text-base font-semibold text-mb-text-primary">Receipt</p>
                <p class="font-mono text-xs text-mb-text-secondary">{{ sale.receipt?.receiptNumber }}</p>
              </div>
              <mb-badge tone="info">{{ sale.branch.code }}</mb-badge>
            </div>
            <dl class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-mb-text-secondary">Service</dt>
                <dd class="font-medium text-mb-text-primary">{{ sale.serviceNameSnapshot }}</dd>
              </div>
              <div>
                <dt class="text-mb-text-secondary">When</dt>
                <dd class="font-medium text-mb-text-primary">{{ formatDateTime(sale.paymentDate) }}</dd>
              </div>
            </dl>
            <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <mb-btn
                variant="secondary"
                class="w-full sm:w-auto"
                (click)="sendWhatsApp(sale)"
                title="Opens WhatsApp with a prefilled thank-you message (you send manually)"
              >
                Send WhatsApp
              </mb-btn>
              <mb-btn variant="secondary" class="w-full sm:w-auto" (click)="lastSale.set(null)">
                Record another
              </mb-btn>
              <mb-btn class="w-full sm:w-auto" (click)="close()">Done</mb-btn>
            </div>
            <p class="mt-4 text-xs text-mb-text-secondary">
              WhatsApp opens in a new tab. If no mobile number is on file, you can still copy the message from the
              generic chat link.
            </p>
          </div>
        </div>
      } @else {
        <app-new-sale-form (saved)="onSaved($event)" />
      }
    </mb-modal>
  `,
})
export class NewSaleModalComponent {
  readonly saleModal = inject(NewSaleModalService);
  readonly currency = inject(CurrencyService);
  readonly formatDateTime = formatDateTime;
  readonly formatPct = formatPct;

  readonly lastSale = signal<TransactionListItem | null>(null);
  private prevOpen = false;

  constructor() {
    effect(() => {
      const o = this.saleModal.open();
      if (o && !this.prevOpen) {
        this.lastSale.set(null);
      }
      this.prevOpen = o;
    });
  }

  onSaved(row: TransactionListItem): void {
    this.lastSale.set(row);
  }

  close(): void {
    this.lastSale.set(null);
    this.saleModal.close();
  }

  sendWhatsApp(t: TransactionListItem): void {
    const text = buildReceiptThankYouMessage({
      customerName: t.customerNameSnapshot,
      branchName: t.branch.name,
      serviceName: t.serviceNameSnapshot,
    });
    openWhatsAppPrefilled(t.customerWhatsappSnapshot ?? t.customerPhoneSnapshot, text);
  }
}
