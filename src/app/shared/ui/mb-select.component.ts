import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs';

export type MbSelectOption = { value: string; label: string };

let mbSelectUid = 0;

@Component({
  selector: 'mb-select',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'mb-select-root block min-w-0' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MbSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative w-full">
      <button
        #trigger
        type="button"
        [class]="triggerClasses()"
        [disabled]="disabled()"
        [attr.id]="triggerId"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listboxId"
        (click)="onTriggerClick($event)"
      >
        <span class="min-w-0 flex-1 truncate font-medium">{{ displayLabel() }}</span>
        <svg
          class="h-5 w-5 shrink-0 transition-colors duration-200"
          [class.text-mb-primary]="open()"
          [class.text-mb-text-secondary]="!open()"
          [class.rotate-180]="open()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      @if (open()) {
        <button
          type="button"
          class="fixed inset-0 z-[1040] cursor-default border-0 bg-transparent"
          aria-hidden="true"
          tabindex="-1"
          (click)="close()"
        ></button>
        <div
          class="mb-select-panel fixed z-[1050] flex flex-col overflow-hidden bg-mb-surface py-1.5"
          [ngClass]="panelShellClass()"
          [style.top.px]="panelTop()"
          [style.left.px]="panelLeft()"
          [style.width.px]="panelWidth()"
          [style.max-height.px]="panelMaxHeight()"
          role="listbox"
          [attr.id]="listboxId"
          [attr.aria-labelledby]="triggerId"
          (click)="$event.stopPropagation()"
        >
          <div class="min-h-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            @for (opt of options(); track opt.value) {
              <button
                type="button"
                role="option"
                class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium transition-colors"
                [ngClass]="optionRowClass(opt.value)"
                [attr.aria-selected]="opt.value === valueSig()"
                (click)="choose(opt.value)"
              >
                <span class="min-w-0 flex-1 break-words leading-snug text-mb-text-primary">{{ opt.label }}</span>
                @if (opt.value === valueSig()) {
                  <svg
                    class="h-4 w-4 shrink-0 text-mb-text-primary opacity-90 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MbSelectComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly options = input<MbSelectOption[]>([]);
  readonly placeholder = input<string>('Select…');
  /** Extra classes for the trigger (e.g. compact height). */
  readonly triggerClass = input<string>('');

  readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  readonly valueSig = signal<string>('');
  readonly open = signal(false);
  readonly disabled = signal(false);

  readonly panelTop = signal(0);
  readonly panelLeft = signal(0);
  readonly panelWidth = signal(0);
  readonly panelMaxHeight = signal(280);
  /** When true, list is anchored flush under the trigger (single composite control). */
  readonly panelOpenDownward = signal(true);

  private readonly uid = ++mbSelectUid;
  readonly triggerId = `mb-select-tr-${this.uid}`;
  readonly listboxId = `mb-select-lb-${this.uid}`;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly displayLabel = computed(() => {
    const v = this.valueSig();
    const opt = this.options().find((o) => o.value === v);
    if (opt) {
      return opt.label;
    }
    return this.placeholder();
  });

  readonly triggerClasses = computed(() => {
    const base =
      'mb-input flex w-full cursor-pointer items-center justify-between gap-2 text-left transition-[box-shadow,border-color,border-radius] duration-200';
    const extra = this.triggerClass().trim();
    let attach = '';
    if (this.open() && this.panelOpenDownward()) {
      attach =
        ' relative z-[1060] rounded-b-none border-mb-primary shadow-[0_0_0_1px_var(--mb-primary-glow)]';
    } else if (this.open() && !this.panelOpenDownward()) {
      attach = ' relative z-[1060] border-mb-primary shadow-[0_0_0_1px_var(--mb-primary-glow)]';
    }
    return [base, extra, attach].filter(Boolean).join(' ');
  });

  readonly panelShellClass = computed(() => {
    if (this.panelOpenDownward()) {
      return {
        'rounded-b-2xl rounded-t-none': true,
        'border border-mb-primary': true,
        'border-t-0': true,
        '-mt-px': true,
        'shadow-xl shadow-slate-900/10 dark:shadow-black/55': true,
      };
    }
    return {
      'rounded-2xl': true,
      'border border-mb-border': true,
      'shadow-mb-card dark:shadow-mb-card-dark': true,
    };
  });

  optionRowClass(value: string): Record<string, boolean> {
    const sel = value === this.valueSig();
    return {
      'bg-[var(--mb-primary-soft)]': sel,
      'text-mb-text-primary': true,
      'hover:bg-[var(--mb-hover-row)]': !sel,
      'active:bg-[var(--mb-primary-soft)]': !sel,
    };
  }

  constructor() {
    fromEvent(window, 'scroll', { capture: true })
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.open()) {
          this.syncPanelPosition();
        }
      });
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.open()) {
          this.syncPanelPosition();
        }
      });
  }

  writeValue(value: string | null): void {
    this.valueSig.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onTriggerClick(ev: Event): void {
    ev.stopPropagation();
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.open.set(true);
      queueMicrotask(() => this.syncPanelPosition());
    }
  }

  choose(value: string): void {
    this.valueSig.set(value);
    this.onChange(value);
    this.close();
  }

  close(): void {
    if (this.open()) {
      this.open.set(false);
      this.onTouched();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && this.open()) {
      ev.preventDefault();
      this.close();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    if (!this.open()) {
      return;
    }
    const t = ev.target as Node;
    if (this.host.nativeElement.contains(t)) {
      return;
    }
    this.close();
  }

  private syncPanelPosition(): void {
    const btn = this.triggerRef()?.nativeElement;
    if (!btn) {
      return;
    }
    const r = btn.getBoundingClientRect();
    const margin = 10;
    const preferredMax = 320;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let width = Math.max(r.width, 160);
    let left = r.left;
    if (left + width > vw - margin) {
      left = Math.max(margin, vw - margin - width);
    }
    if (left < margin) {
      left = margin;
      width = Math.min(width, vw - margin * 2);
    }

    const gapDetached = 8;
    const spaceBelow = vh - r.bottom - margin;
    const spaceAbove = r.top - margin;
    const openDown = spaceBelow >= 140 || spaceBelow >= spaceAbove;
    this.panelOpenDownward.set(openDown);

    let maxH = Math.min(preferredMax, openDown ? spaceBelow - gapDetached : spaceAbove - gapDetached);
    let top: number;
    if (openDown) {
      top = Math.round(r.bottom);
      if (top + maxH > vh - margin) {
        maxH = Math.max(120, vh - margin - top);
      }
    } else {
      maxH = Math.min(maxH, spaceAbove - gapDetached);
      top = r.top - gapDetached - maxH;
      if (top < margin) {
        top = margin;
        maxH = Math.max(120, Math.min(maxH, r.top - gapDetached - margin));
      }
    }

    this.panelTop.set(top);
    this.panelLeft.set(left);
    this.panelWidth.set(width);
    this.panelMaxHeight.set(Math.max(120, maxH));
  }
}
