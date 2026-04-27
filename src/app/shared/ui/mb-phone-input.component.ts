import {
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  signal,
  viewChild,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs';
import {
  MB_DEFAULT_PHONE_ISO2,
  MB_PHONE_COUNTRIES,
  mbFlagEmoji,
  mbFormatStoredPhone,
  mbParseStoredPhone,
  type MbPhoneCountry,
} from '../phone/phone-countries';

@Component({
  standalone: true,
  selector: 'mb-phone-input',
  imports: [],
  host: { class: 'relative block w-full' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MbPhoneInputComponent),
      multi: true,
    },
  ],
  template: `
    <div #shell class="mb-phone-input-shell" [class.is-disabled]="disabled()">
      <button
        type="button"
        class="flex h-full shrink-0 items-center gap-2 py-0 pl-4 pr-2 text-left outline-none transition hover:bg-[var(--mb-hover-row)] focus-visible:ring-2 focus-visible:ring-[var(--mb-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mb-input-bg)] disabled:cursor-not-allowed"
        [disabled]="disabled()"
        (click)="onCountryTriggerClick($event)"
        [attr.aria-expanded]="pickerOpen()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-label]="'Country code, ' + selectedCountry().name + ', change country'"
      >
        <span class="text-base leading-none" aria-hidden="true">{{ flagEmoji() }}</span>
        <span class="tabular-nums text-mb-text-primary">{{ selectedCountry().dial }}</span>
      </button>
      <div class="w-px shrink-0 self-stretch bg-mb-border" aria-hidden="true"></div>
      <input
        #telInput
        type="tel"
        inputmode="numeric"
        autocomplete="tel-national"
        [placeholder]="placeholder()"
        [value]="nationalDigits()"
        [disabled]="disabled()"
        (input)="onNationalInput($event)"
        (blur)="markTouched()"
        class="mb-phone-input-national h-full min-h-0 min-w-0 flex-1 border-0 bg-transparent py-0 pl-3 pr-4 text-base font-medium leading-snug text-mb-text-primary outline-none placeholder:font-normal disabled:cursor-not-allowed"
      />
    </div>

    @if (pickerOpen()) {
      <button
        type="button"
        class="fixed inset-0 z-[90] cursor-default border-0 bg-transparent"
        aria-hidden="true"
        tabindex="-1"
        (click)="closeFromScrim()"
      ></button>
      <div
        class="mb-select-panel fixed z-[100] flex flex-col overflow-hidden rounded-2xl border border-mb-border bg-mb-surface py-1 shadow-mb-card dark:shadow-mb-card-dark"
        [style.top.px]="panelTop()"
        [style.left.px]="panelLeft()"
        [style.width.px]="panelWidth()"
        [style.max-height.px]="panelMaxHeight()"
        role="dialog"
        [attr.aria-label]="pickerTitle()"
        (click)="$event.stopPropagation()"
      >
        <span class="sr-only">{{ pickerTitle() }}</span>
        <div class="shrink-0 border-b border-mb-border px-2 pb-2 pt-1">
          <input
            #searchInDialog
            type="search"
            class="mb-input w-full"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            [placeholder]="searchPlaceholder()"
            autocomplete="off"
            autocorrect="off"
          />
        </div>
        <div
          class="max-h-40 overflow-y-auto overscroll-contain px-1 [-webkit-overflow-scrolling:touch]"
          role="listbox"
        >
          @for (c of filteredCountries(); track c.iso2) {
            <button
              type="button"
              role="option"
              class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition hover:bg-[var(--mb-hover-row)] active:bg-[var(--mb-primary-soft)]"
              [class.bg-[var(--mb-primary-soft)]]="c.iso2 === selectedCountry().iso2"
              (click)="selectCountry(c)"
            >
              <span class="text-base leading-none" aria-hidden="true">{{ emojiFor(c) }}</span>
              <span class="shrink-0 tabular-nums text-mb-text-secondary">{{ c.dial }}</span>
              <span class="min-w-0 truncate text-mb-text-primary">{{ c.name }}</span>
            </button>
          }
          @if (filteredCountries().length === 0) {
            <p class="px-2 py-6 text-center text-xs text-mb-text-secondary">No countries match.</p>
          }
        </div>
      </div>
    }
  `,
})
export class MbPhoneInputComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly placeholder = input('xxx xxx xxx');
  readonly searchPlaceholder = input('Rechercher un pays…');
  readonly pickerTitle = input('Country code');

  private readonly shellRef = viewChild<ElementRef<HTMLElement>>('shell');
  private readonly telInput = viewChild<ElementRef<HTMLInputElement>>('telInput');
  private readonly searchInDialog = viewChild<ElementRef<HTMLInputElement>>('searchInDialog');

  readonly pickerOpen = signal(false);
  readonly panelTop = signal(0);
  readonly panelLeft = signal(0);
  readonly panelWidth = signal(0);
  /** Header + ~4 list rows + padding; keeps the panel compact. */
  readonly panelMaxHeight = signal(220);

  readonly selectedIso = signal(MB_DEFAULT_PHONE_ISO2);
  readonly nationalDigits = signal('');
  readonly searchQuery = signal('');

  readonly selectedCountry = computed(
    () => MB_PHONE_COUNTRIES.find((c) => c.iso2 === this.selectedIso()) ?? MB_PHONE_COUNTRIES[0],
  );

  readonly flagEmoji = computed(() => mbFlagEmoji(this.selectedCountry().iso2));

  readonly filteredCountries = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      return MB_PHONE_COUNTRIES;
    }
    return MB_PHONE_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        c.iso2.toLowerCase().includes(q),
    );
  });

  protected readonly disabled = signal(false);
  private onChange: (v: string) => void = () => {};
  private cvaTouched: () => void = () => {};

  constructor() {
    fromEvent(window, 'scroll', { capture: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.pickerOpen()) {
          this.syncPanelPosition();
        }
      });
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.pickerOpen()) {
          this.syncPanelPosition();
        }
      });
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && this.pickerOpen()) {
      ev.preventDefault();
      this.closePicker();
      this.markTouched();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent): void {
    if (!this.pickerOpen()) {
      return;
    }
    const t = ev.target as Node;
    if (this.host.nativeElement.contains(t)) {
      return;
    }
    this.closePicker();
    this.markTouched();
  }

  emojiFor(c: MbPhoneCountry): string {
    return mbFlagEmoji(c.iso2);
  }

  writeValue(value: string | null): void {
    const { country, nationalDigits } = mbParseStoredPhone(value ?? '');
    this.selectedIso.set(country.iso2);
    this.nationalDigits.set(nationalDigits);
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.cvaTouched = fn;
  }

  markTouched(): void {
    this.cvaTouched();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onCountryTriggerClick(ev: Event): void {
    ev.stopPropagation();
    if (this.disabled()) {
      return;
    }
    if (this.pickerOpen()) {
      this.closePicker();
      this.markTouched();
    } else {
      this.searchQuery.set('');
      this.pickerOpen.set(true);
      queueMicrotask(() => {
        this.syncPanelPosition();
        setTimeout(() => this.searchInDialog()?.nativeElement?.focus(), 0);
      });
    }
  }

  closeFromScrim(): void {
    this.closePicker();
    this.markTouched();
  }

  closePicker(): void {
    this.pickerOpen.set(false);
  }

  selectCountry(c: MbPhoneCountry): void {
    this.selectedIso.set(c.iso2);
    this.emitValue();
    this.closePicker();
    this.markTouched();
    setTimeout(() => this.telInput()?.nativeElement?.focus(), 0);
  }

  onSearchInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.searchQuery.set(v ?? '');
  }

  onNationalInput(ev: Event): void {
    const raw = (ev.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 15);
    this.nationalDigits.set(raw);
    this.emitValue();
  }

  private emitValue(): void {
    const c = this.selectedCountry();
    this.onChange(mbFormatStoredPhone(c.dial, this.nationalDigits()));
  }

  private syncPanelPosition(): void {
    const shell = this.shellRef()?.nativeElement;
    if (!shell) {
      return;
    }
    const r = shell.getBoundingClientRect();
    const gap = 8;
    const margin = 10;
    const preferredMax = 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let width = Math.max(r.width, 200);
    width = Math.min(width, 320);
    let left = r.left;
    if (left + width > vw - margin) {
      left = Math.max(margin, vw - margin - width);
    }
    if (left < margin) {
      left = margin;
      width = Math.min(width, vw - margin * 2);
    }

    const spaceBelow = vh - r.bottom - gap - margin;
    const spaceAbove = r.top - gap - margin;
    const openDown = spaceBelow >= 100 || spaceBelow >= spaceAbove;
    let maxH = Math.min(preferredMax, openDown ? spaceBelow : spaceAbove);
    let top: number;
    if (openDown) {
      top = r.bottom + gap;
      if (top + maxH > vh - margin) {
        maxH = Math.max(100, vh - margin - top);
      }
    } else {
      maxH = Math.min(maxH, spaceAbove);
      top = r.top - gap - maxH;
      if (top < margin) {
        top = margin;
        maxH = Math.max(100, Math.min(maxH, r.top - gap - margin));
      }
    }

    this.panelTop.set(top);
    this.panelLeft.set(left);
    this.panelWidth.set(width);
    this.panelMaxHeight.set(Math.max(100, Math.min(maxH, preferredMax)));
  }
}
