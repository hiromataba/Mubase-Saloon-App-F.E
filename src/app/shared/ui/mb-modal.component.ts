import {
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  output,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { I18nService } from '../../core/locale/i18n.service';

@Component({
  selector: 'mb-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center px-2 py-4 sm:p-8 animate-fade-in"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title() ? 'mb-modal-title' : null"
      >
        <button
          type="button"
          class="absolute inset-0 bg-[var(--mb-backdrop)] backdrop-blur-[4px]"
          [attr.aria-label]="i18n.t('modal.ariaCloseDialog')"
          (click)="backdropClose.emit()"
        ></button>
        <div
          class="relative z-10 flex max-h-[min(92vh,920px)] w-full animate-scale-in flex-col overflow-hidden rounded-3xl border border-mb-border bg-mb-surface shadow-modal dark:shadow-modal-dark"
          [class]="panelClass()"
          (click)="$event.stopPropagation()"
        >
          <div
            class="flex shrink-0 items-start justify-between gap-3 border-b border-mb-border bg-mb-elevated px-3 py-4 sm:gap-4 sm:px-8 sm:py-5 dark:bg-mb-elevated"
          >
            <div class="min-w-0 pr-2">
              @if (title()) {
                <h2
                  id="mb-modal-title"
                  class="font-display text-xl font-semibold tracking-tight text-mb-text-primary"
                >
                  {{ title() }}
                </h2>
              }
              @if (description()) {
                <p class="mt-2 text-sm font-normal leading-relaxed text-mb-text-secondary">{{ description() }}</p>
              }
            </div>
            <button
              type="button"
              class="-m-1 shrink-0 rounded-xl p-2 text-mb-text-secondary transition hover:bg-[var(--mb-hover-row)] hover:text-mb-text-primary"
              (click)="closeClick.emit()"
              [attr.aria-label]="i18n.t('modal.ariaClose')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto bg-mb-surface px-3 py-5 sm:px-8 sm:py-8">
            <ng-content />
          </div>
          @if (footer()) {
            <div
              class="shrink-0 border-t border-mb-border bg-mb-elevated px-3 py-3 sm:px-8 sm:py-4 dark:bg-mb-elevated"
            >
              <ng-content select=".mb-modal-footer-actions" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class MbModalComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  readonly i18n = inject(I18nService);

  readonly open = input(false);
  readonly title = input('');
  readonly description = input('');
  readonly size = input<'md' | 'lg' | 'xl' | 'wide' | 'full'>('lg');
  readonly footer = input(false);
  readonly backdropClose = output<void>();
  readonly closeClick = output<void>();

  constructor() {
    effect(() => {
      if (this.open()) {
        this.document.body.style.overflow = 'hidden';
      } else {
        this.document.body.style.overflow = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }

  panelClass(): string {
    const s = this.size();
    const map = {
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-3xl',
      wide: 'max-w-5xl',
      full: 'max-w-6xl',
    }[s];
    return map;
  }
}
