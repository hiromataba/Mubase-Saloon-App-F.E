import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'mb-btn',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="classes()"
    >
      <ng-content />
    </button>
  `,
  host: { class: 'inline-flex' },
})
export class MbButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');
  readonly block = input(false);

  readonly classes = computed(() => {
    const v = this.variant();
    const s = this.size();
    const base =
      'items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mb-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-mb-ring-offset disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] active:transition-transform';
    const sizes = {
      sm: 'px-3.5 py-2 text-xs font-semibold',
      md: 'px-4 py-2.5 text-sm font-semibold',
      lg: 'px-5 py-3 text-sm font-semibold',
    }[s];
    const variants = {
      primary:
        'border border-transparent bg-mb-primary text-white shadow-md hover:bg-mb-primary-hover hover:shadow-lg dark:shadow-black/35',
      secondary:
        'border border-mb-border bg-mb-surface text-mb-text-primary shadow-mb-card hover:border-mb-border hover:bg-mb-elevated dark:shadow-mb-card-dark',
      ghost:
        'border border-transparent text-mb-text-secondary hover:bg-[var(--mb-hover-row)] hover:text-mb-text-primary',
      danger:
        'border border-transparent bg-mb-danger text-white shadow-sm hover:bg-mb-danger-hover',
    }[v];
    const w = this.block() ? 'w-full flex' : 'inline-flex';
    return [w, base, sizes, variants].join(' ');
  });
}
