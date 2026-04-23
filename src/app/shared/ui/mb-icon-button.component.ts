import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'mb-icon-btn',
  standalone: true,
  template: `
    <button [type]="type()" [disabled]="disabled()" [attr.aria-label]="ariaLabel()" [class]="classes()">
      <ng-content />
    </button>
  `,
  host: { class: 'inline-flex' },
})
export class MbIconButtonComponent {
  readonly ariaLabel = input.required<string>();
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<'ghost' | 'soft'>('ghost');
  readonly size = input<'sm' | 'md'>('sm');

  readonly classes = computed(() => {
    const sz = this.size() === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
    const base =
      `${sz} shrink-0 items-center justify-center rounded-xl transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-mb-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-mb-ring-offset disabled:pointer-events-none disabled:opacity-40 active:scale-[0.96]`;
    const v =
      this.variant() === 'soft'
        ? 'border border-mb-border bg-mb-surface text-mb-text-secondary shadow-sm hover:border-mb-border hover:bg-mb-elevated hover:text-mb-text-primary dark:shadow-mb-card-dark'
        : 'border border-transparent text-mb-text-secondary hover:bg-[var(--mb-hover-row)] hover:text-mb-text-primary';
    return `${base} ${v}`;
  });
}
