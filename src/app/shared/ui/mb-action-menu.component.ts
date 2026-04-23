import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, input, output, signal } from '@angular/core';

export interface MbActionMenuItem {
  id: string;
  label: string;
  danger?: boolean;
}

@Component({
  selector: 'mb-action-menu',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="relative inline-flex" #root>
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-mb-border bg-mb-surface text-mb-text-secondary shadow-sm transition duration-150 hover:border-mb-border hover:bg-mb-elevated hover:text-mb-text-primary active:scale-[0.96] dark:shadow-mb-card-dark"
        [attr.aria-expanded]="menuOpen()"
        [attr.aria-label]="'Open actions'"
        (click)="onTrigger($event)"
      >
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"
          />
        </svg>
      </button>
      @if (menuOpen()) {
        <div
          class="absolute right-0 z-50 mt-1.5 min-w-[12rem] overflow-hidden rounded-2xl border border-mb-border bg-mb-surface/98 py-1 shadow-modal backdrop-blur-md dark:bg-mb-elevated/98 dark:shadow-modal-dark"
          role="menu"
          (click)="$event.stopPropagation()"
        >
          @for (item of items(); track item.id) {
            <button
              type="button"
              role="menuitem"
              class="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition duration-150"
              [ngClass]="
                item.danger
                  ? 'text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15'
                  : 'text-mb-text-primary hover:bg-[var(--mb-hover-row)]'
              "
              (click)="pick(item.id)"
            >
              {{ item.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  host: {
    '(document:click)': 'closeOnOutside($event)',
  },
})
export class MbActionMenuComponent {
  private readonly host = inject(ElementRef);

  readonly items = input<MbActionMenuItem[]>([]);
  readonly picked = output<string>();

  readonly menuOpen = signal(false);

  onTrigger(ev: Event): void {
    ev.stopPropagation();
    this.menuOpen.update((v) => !v);
  }

  pick(id: string): void {
    this.menuOpen.set(false);
    this.picked.emit(id);
  }

  closeOnOutside(ev: Event): void {
    if (!this.menuOpen()) {
      return;
    }
    const t = ev.target as Node;
    if (!this.host.nativeElement.contains(t)) {
      this.menuOpen.set(false);
    }
  }
}
