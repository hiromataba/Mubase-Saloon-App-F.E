import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MbSelectComponent } from './mb-select.component';

@Component({
  selector: 'mb-table-paginator',
  standalone: true,
  imports: [FormsModule, MbSelectComponent],
  host: { class: 'block min-w-0 max-w-full' },
  template: `
    @if (total() > 0 || showWhenEmpty()) {
      <div
        class="mt-1.5 flex min-w-0 max-w-full flex-col gap-3 border-t border-mb-border bg-mb-elevated/30 px-3 py-3.5 text-sm text-mb-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:bg-mb-elevated/20"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-mb-text-secondary">Rows per page</span>
          <mb-select
            class="w-[4.5rem]"
            [options]="pageSizeSelectOptions()"
            [ngModel]="'' + pageSize()"
            (ngModelChange)="onPageSizePick($event)"
            triggerClass="h-9 py-0 pr-9 text-xs tabular-nums"
            placeholder="—"
          />
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="tabular-nums text-xs sm:text-sm">
            {{ rangeStart() }}–{{ rangeEnd() }} of {{ total() }}
          </span>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="rounded-lg border border-mb-border p-1.5 text-mb-text-secondary transition hover:bg-mb-surface hover:shadow-sm disabled:opacity-40 dark:hover:bg-mb-elevated"
              [disabled]="page() <= 0"
              (click)="pageChange.emit(0)"
              aria-label="First page"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              class="rounded-lg border border-mb-border p-1.5 text-mb-text-secondary transition hover:bg-mb-surface hover:shadow-sm disabled:opacity-40 dark:hover:bg-mb-elevated"
              [disabled]="page() <= 0"
              (click)="pageChange.emit(page() - 1)"
              aria-label="Previous page"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              class="rounded-lg border border-mb-border p-1.5 text-mb-text-secondary transition hover:bg-mb-surface hover:shadow-sm disabled:opacity-40 dark:hover:bg-mb-elevated"
              [disabled]="page() >= lastPage()"
              (click)="pageChange.emit(page() + 1)"
              aria-label="Next page"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              class="rounded-lg border border-mb-border p-1.5 text-mb-text-secondary transition hover:bg-mb-surface hover:shadow-sm disabled:opacity-40 dark:hover:bg-mb-elevated"
              [disabled]="page() >= lastPage()"
              (click)="pageChange.emit(lastPage())"
              aria-label="Last page"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class MbTablePaginatorComponent {
  readonly total = input.required<number>();
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input<number[]>([5, 10, 25, 50]);
  /** Show footer even when total is 0 (e.g. empty state with page size selector). */
  readonly showWhenEmpty = input(false);

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly lastPage = computed(() => {
    const t = this.total();
    const s = this.pageSize();
    if (t <= 0) {
      return 0;
    }
    return Math.ceil(t / s) - 1;
  });

  readonly rangeStart = computed(() => {
    if (this.total() === 0) {
      return 0;
    }
    return this.page() * this.pageSize() + 1;
  });

  readonly rangeEnd = computed(() => {
    return Math.min((this.page() + 1) * this.pageSize(), this.total());
  });

  readonly pageSizeSelectOptions = computed(() =>
    this.pageSizeOptions().map((n) => ({ value: String(n), label: String(n) })),
  );

  onPageSizePick(v: string): void {
    const n = Number(v);
    if (!Number.isNaN(n)) {
      this.pageSizeChange.emit(n);
    }
  }
}
