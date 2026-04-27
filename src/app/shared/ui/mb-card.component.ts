import { Component, input } from '@angular/core';

@Component({
  selector: 'mb-card',
  standalone: true,
  template: `
    <div [class]="cardClass()">
      @if (title()) {
        <div
          class="min-w-0 border-b border-mb-border bg-mb-elevated/50 px-4 py-4 sm:px-7 sm:py-5 lg:px-8 lg:py-6 dark:bg-mb-elevated/30"
        >
          <h2 class="font-display break-words text-base font-semibold tracking-tight text-mb-text-primary">
            {{ title() }}
          </h2>
          @if (subtitle()) {
            <p class="mt-1.5 text-sm font-normal leading-relaxed text-mb-text-secondary">
              {{ subtitle() }}
            </p>
          }
        </div>
      }
      <div [class]="padding() ? 'min-w-0 max-w-full p-4 sm:p-6 sm:p-7 lg:p-8' : ''">
        <ng-content />
      </div>
    </div>
  `,
})
export class MbCardComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly padding = input(true);
  readonly elevated = input(true);
  /** Extra classes on the outer card (e.g. responsive spacing). */
  readonly extraClass = input<string>('');

  cardClass(): string {
    const base =
      'max-w-full rounded-2xl border border-mb-border bg-mb-surface overflow-hidden';
    const shadow = this.elevated()
      ? 'shadow-mb-card transition-shadow duration-300 hover:shadow-mb-card-hover dark:shadow-mb-card-dark dark:hover:shadow-mb-card-hover-dark'
      : '';
    const extra = this.extraClass().trim();
    return [base, shadow, extra].filter(Boolean).join(' ');
  }
}
