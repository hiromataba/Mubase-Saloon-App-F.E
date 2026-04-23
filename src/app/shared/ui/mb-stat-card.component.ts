import { Component, input } from '@angular/core';

export type MbStatCardIcon = 'revenue' | 'wallet' | 'team' | 'activity';

@Component({
  selector: 'mb-stat-card',
  standalone: true,
  template: `
    <div
      class="group relative overflow-hidden rounded-2xl border border-mb-border bg-mb-surface p-6 shadow-mb-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-mb-card-hover dark:shadow-mb-card-dark dark:hover:shadow-mb-card-hover-dark"
    >
      <div
        class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[var(--mb-primary-soft)] to-transparent opacity-90 blur-2xl transition duration-500 group-hover:opacity-100"
      ></div>
      <div
        class="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-[var(--mb-primary-soft)] opacity-40 blur-2xl"
      ></div>

      <div class="relative flex items-start justify-between gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-mb-border bg-[var(--mb-primary-soft)] text-mb-primary shadow-sm dark:border-mb-border dark:bg-[var(--mb-primary-soft)]"
        >
          @switch (icon()) {
            @case ('revenue') {
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
            @case ('wallet') {
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
            @case ('team') {
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
            @case ('activity') {
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            }
          }
        </div>
        @if (trend(); as tr) {
          @if (tr.up) {
            <span
              class="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-emerald-500/12 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-700 ring-1 ring-inset ring-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/20"
            >
              <span class="text-[0.7rem] leading-none">↑</span>
              {{ tr.text }}
            </span>
          } @else {
            <span
              class="inline-flex shrink-0 items-center gap-0.5 rounded-lg bg-rose-500/12 px-2 py-0.5 text-xs font-semibold tabular-nums text-rose-700 ring-1 ring-inset ring-rose-500/15 dark:text-rose-300 dark:ring-rose-500/20"
            >
              <span class="text-[0.7rem] leading-none">↓</span>
              {{ tr.text }}
            </span>
          }
        }
      </div>

      <p class="relative mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-mb-text-secondary">
        {{ label() }}
      </p>
      <p class="relative mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight text-mb-text-primary">
        {{ value() }}
      </p>
      @if (hint()) {
        <p class="relative mt-2 text-xs font-normal leading-relaxed text-mb-text-secondary">{{ hint() }}</p>
      }
      @if (trend()?.hint) {
        <p class="relative mt-2 text-[11px] font-medium text-mb-text-secondary opacity-80">{{ trend()!.hint }}</p>
      }
    </div>
  `,
})
export class MbStatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>('');
  readonly icon = input<MbStatCardIcon>('revenue');
  /** Optional trend from existing analytics (e.g. chart deltas). */
  readonly trend = input<{ text: string; up: boolean; hint?: string } | null>(null);
}
