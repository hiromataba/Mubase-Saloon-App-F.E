import { Component, computed, effect, input, signal } from '@angular/core';
import { initialsFromLabel } from '../display/initials.util';

@Component({
  selector: 'mb-avatar',
  standalone: true,
  template: `
    <span
      [class]="boxClass()"
      class="inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-display font-semibold tracking-tight ring-1 ring-inset ring-slate-900/5 dark:ring-white/10"
      [attr.aria-hidden]="true"
      [title]="label()"
    >
      @if (showPhoto()) {
        <img
          [src]="photoUrl()!"
          alt=""
          class="h-full w-full object-cover"
          loading="lazy"
          (error)="onImgError()"
        />
      } @else {
        {{ initials() }}
      }
    </span>
  `,
})
export class MbAvatarComponent {
  /** Display name used for initials + tooltip. */
  readonly label = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Optional portrait (URL or data URL). Falls back to initials on error or when omitted. */
  readonly photoUrl = input<string | null | undefined>(null);

  private readonly imgFailed = signal(false);

  readonly initials = computed(() => initialsFromLabel(this.label()));

  readonly showPhoto = computed(() => {
    const u = this.photoUrl()?.trim();
    return !!u && !this.imgFailed();
  });

  readonly boxClass = computed(() => {
    const s = this.size();
    if (s === 'sm') {
      return 'h-8 w-8 text-[10px] bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200';
    }
    if (s === 'lg') {
      return 'h-14 w-14 text-sm bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200';
    }
    return 'h-9 w-9 text-[11px] bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-700 dark:from-slate-700 dark:to-slate-800 dark:text-slate-200';
  });

  constructor() {
    effect(() => {
      this.photoUrl();
      this.imgFailed.set(false);
    });
  }

  onImgError(): void {
    this.imgFailed.set(true);
  }
}
