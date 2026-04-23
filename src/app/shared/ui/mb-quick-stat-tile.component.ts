import { Component, input } from '@angular/core';

export type MbQuickStatVariant = 'violet' | 'emerald' | 'amber' | 'sky';

@Component({
  selector: 'mb-quick-stat-tile',
  standalone: true,
  template: `
    <div
      class="group relative min-w-[152px] shrink-0 snap-start overflow-hidden rounded-2xl border border-mb-border bg-mb-surface p-5 shadow-mb-card transition-all duration-300 hover:-translate-y-px hover:shadow-mb-card-hover dark:shadow-mb-card-dark dark:hover:shadow-mb-card-hover-dark md:min-w-0"
    >
      @switch (variant()) {
        @case ('violet') {
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.07] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-violet-400/[0.12]"
          ></div>
        }
        @case ('emerald') {
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-emerald-400/[0.1]"
          ></div>
        }
        @case ('amber') {
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/[0.08] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-amber-400/[0.1]"
          ></div>
        }
        @case ('sky') {
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/[0.07] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-sky-400/[0.1]"
          ></div>
        }
      }
      <div class="relative flex items-start justify-between gap-2">
        <span
          class="mt-1 h-2 w-2 shrink-0 rounded-full ring-2 ring-mb-surface dark:ring-mb-surface"
          [class.bg-violet-500]="variant() === 'violet'"
          [class.bg-emerald-500]="variant() === 'emerald'"
          [class.bg-amber-500]="variant() === 'amber'"
          [class.bg-sky-500]="variant() === 'sky'"
        ></span>
        @if (trend(); as tr) {
          <span
            class="text-[11px] font-semibold tabular-nums"
            [class.text-emerald-600]="tr.up"
            [class.dark:text-emerald-400]="tr.up"
            [class.text-rose-600]="!tr.up"
            [class.dark:text-rose-400]="!tr.up"
          >
            {{ tr.up ? '↑' : '↓' }}{{ tr.text }}
          </span>
        }
      </div>
      <p class="relative mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-mb-text-secondary">
        {{ label() }}
      </p>
      <p class="relative mt-1.5 font-display text-xl font-semibold tabular-nums tracking-tight text-mb-text-primary">
        {{ value() }}
      </p>
      @if (hint()) {
        <p class="relative mt-2 text-xs font-normal leading-relaxed text-mb-text-secondary">{{ hint() }}</p>
      }
    </div>
  `,
})
export class MbQuickStatTileComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>('');
  readonly variant = input<MbQuickStatVariant>('emerald');
  readonly trend = input<{ text: string; up: boolean } | null>(null);
}
