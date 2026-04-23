import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'mb-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class MbBadgeComponent {
  readonly tone = input<'neutral' | 'success' | 'warning' | 'info' | 'danger'>('neutral');
  readonly soft = input(true);
  /** Uppercase + wide tracking (off for compact labels like payment type). */
  readonly caps = input(true);

  readonly classes = computed(() => {
    const t = this.tone();
    const soft = this.soft();
    const caps = this.caps();
    const typo = caps
      ? 'text-[11px] uppercase tracking-wide'
      : 'text-xs font-medium normal-case tracking-normal';
    const base = `inline-flex items-center rounded-lg px-2 py-0.5 font-semibold ${typo}`;
    if (soft) {
      const map = {
        neutral:
          'bg-[var(--mb-hover-row)] text-mb-text-primary ring-1 ring-inset ring-mb-border dark:bg-mb-elevated/80 dark:text-mb-text-primary',
        success:
          'bg-emerald-500/12 text-emerald-800 ring-1 ring-inset ring-emerald-500/12 dark:text-emerald-300 dark:ring-emerald-500/15',
        warning:
          'bg-amber-500/12 text-amber-900 ring-1 ring-inset ring-amber-500/12 dark:text-amber-300 dark:ring-amber-500/15',
        info:
          'bg-[var(--mb-primary-soft)] text-mb-primary ring-1 ring-inset ring-[color-mix(in_srgb,var(--mb-primary)_22%,transparent)] dark:text-mb-primary',
        danger:
          'bg-red-500/12 text-red-800 ring-1 ring-inset ring-red-500/12 dark:text-red-300 dark:ring-red-500/15',
      }[t];
      return `${base} ${map}`;
    }
    const map = {
      neutral: 'bg-mb-text-primary text-mb-surface dark:bg-mb-text-secondary dark:text-mb-bg',
      success: 'bg-emerald-600 text-white',
      warning: 'bg-amber-500 text-slate-900',
      info: 'bg-mb-primary text-white',
      danger: 'bg-red-600 text-white',
    }[t];
    return `${base} ${map}`;
  });
}
