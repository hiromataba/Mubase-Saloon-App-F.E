import { Component, input } from '@angular/core';

@Component({
  selector: 'mb-field',
  standalone: true,
  template: `
    <div class="block w-full">
      <div class="mt-[7px] flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
        <span class="text-[0.8125rem] font-semibold leading-snug tracking-tight text-mb-text-primary">
          {{ label() }}
        </span>
        @if (required()) {
          <span class="text-sm font-semibold text-rose-500 dark:text-rose-400" aria-hidden="true">*</span>
        }
        @if (optional()) {
          <span class="text-xs font-normal text-mb-text-secondary opacity-90">(optional)</span>
        }
      </div>
      @if (hint()) {
        <p class="mt-1 text-xs font-normal leading-relaxed text-mb-text-secondary">{{ hint() }}</p>
      }
      <div class="mt-2.5">
        <ng-content />
      </div>
    </div>
  `,
})
export class MbFieldComponent {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  /** Shows a required asterisk (visual only; add Validators to the control). */
  readonly required = input(false);
  readonly optional = input(false);
}
