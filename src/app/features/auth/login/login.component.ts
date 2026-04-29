import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/locale/i18n.service';
import { LocaleService } from '../../../core/locale/locale.service';
import { MOCK_BARBER_PROFILES, MOCK_BRANCH_STAFF, MOCK_USERS, MOCK_SEED_LOGIN_PASSWORD } from '../../../data/mock/mock-seed';
import { MbButtonComponent } from '../../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../../shared/ui/mb-card.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MbButtonComponent, MbCardComponent],
  template: `
    <div
      class="relative min-h-screen overflow-hidden bg-gradient-to-br from-mb-bg via-mb-surface to-[#e8ecf4] dark:from-mb-bg dark:via-mb-surface dark:to-[#0d1528]"
    >
      <div class="pointer-events-none absolute right-4 top-4 z-20 md:right-8 md:top-8">
        <div
          class="flex shrink-0 items-center rounded-xl border border-mb-border bg-mb-surface/90 p-0.5 shadow-sm backdrop-blur-sm dark:bg-mb-elevated/90"
          role="group"
          [attr.aria-label]="i18n.t('shell.language')"
        >
          <button
            type="button"
            class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition sm:text-xs"
            [class.bg-white]="locale.locale() === 'en'"
            [class.dark:bg-mb-surface]="locale.locale() === 'en'"
            [class.text-mb-text-primary]="locale.locale() === 'en'"
            [class.text-mb-text-secondary]="locale.locale() !== 'en'"
            (click)="locale.setLocale('en')"
          >
            EN
          </button>
          <button
            type="button"
            class="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition sm:text-xs"
            [class.bg-white]="locale.locale() === 'fr'"
            [class.dark:bg-mb-surface]="locale.locale() === 'fr'"
            [class.text-mb-text-primary]="locale.locale() === 'fr'"
            [class.text-mb-text-secondary]="locale.locale() !== 'fr'"
            (click)="locale.setLocale('fr')"
          >
            FR
          </button>
        </div>
      </div>

      <div
        class="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[var(--mb-primary-soft)] blur-3xl dark:opacity-60"
      ></div>
      <div
        class="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl dark:bg-violet-600/20"
      ></div>

      <div class="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12 lg:flex-row lg:items-center lg:gap-12">
        <div class="mb-10 max-w-xl lg:mb-0">
          <p class="text-sm font-semibold uppercase tracking-widest text-mb-primary">
            {{ i18n.t('login.heroKicker') }}
          </p>
          <h1 class="mt-3 font-display text-4xl font-bold tracking-tight text-mb-text-primary lg:text-5xl">
            {{ i18n.t('login.heroTitle') }}
          </h1>
          <p class="mt-4 text-lg font-normal text-mb-text-secondary">
            {{ i18n.t('login.heroSubtitle') }}
          </p>
          <ul class="mt-8 space-y-3 text-sm text-mb-text-secondary">
            <li class="flex gap-2">
              <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mb-primary"></span>
              {{ i18n.t('login.bulletPermissions') }}
            </li>
            <li class="flex gap-2">
              <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mb-primary"></span>
              {{ i18n.t('login.bulletTheme') }}
            </li>
          </ul>
        </div>

        <div class="w-full max-w-md space-y-6">
          <mb-card [elevated]="true" [title]="i18n.t('login.signIn')" [subtitle]="i18n.t('login.signInSubtitle')">
            <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
              <div>
                <label class="mt-[7px] text-sm font-medium text-mb-text-primary" for="email">{{
                  i18n.t('login.email')
                }}</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="mb-input mt-1.5"
                  autocomplete="username"
                />
              </div>
              <div>
                <label class="mt-[7px] text-sm font-medium text-mb-text-primary" for="password">{{
                  i18n.t('login.password')
                }}</label>
                <input
                  id="password"
                  type="password"
                  formControlName="password"
                  class="mb-input mt-1.5"
                  autocomplete="current-password"
                />
              </div>
              @if (error()) {
                <p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                  {{ error() }}
                </p>
              }
              <mb-btn type="submit" [block]="true" [disabled]="form.invalid || loading()">
                @if (loading()) {
                  {{ i18n.t('login.signingIn') }}
                } @else {
                  {{ i18n.t('login.submit') }}
                }
              </mb-btn>
            </form>
          </mb-card>

          <mb-card [title]="i18n.t('login.demoAccounts')" [subtitle]="i18n.t('login.demoSubtitle')">
            <div class="grid gap-2 sm:grid-cols-2">
              @for (u of demoUsers; track u.email) {
                <button
                  type="button"
                  class="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-left text-sm transition hover:border-emerald-500/40 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
                  (click)="pickDemo(u.email)"
                >
                  <span class="font-semibold text-slate-900 dark:text-white">{{ u.fullName }}</span>
                  <span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{{ u.email }}</span>
                  <span
                    class="mt-1 inline-block rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300"
                  >
                    {{ roleLabel(u) }}
                  </span>
                </button>
              }
            </div>
          </mb-card>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly locale = inject(LocaleService);
  readonly i18n = inject(I18nService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Owner, managers, accountant, and one barber — enough to demo each workspace. */
  readonly demoUsers = MOCK_USERS.slice(0, 5);

  readonly form = this.fb.nonNullable.group({
    email: ['owner@mubase.demo', [Validators.required, Validators.email]],
    password: [MOCK_SEED_LOGIN_PASSWORD, [Validators.required, Validators.minLength(8)]],
  });

  roleLabel(u: (typeof MOCK_USERS)[0]): string {
    if (u.isOwner) {
      return this.i18n.t('login.role.owner');
    }
    if (MOCK_BARBER_PROFILES.some((b) => b.userId === u.id)) {
      return this.i18n.t('login.role.barber');
    }
    const staff = MOCK_BRANCH_STAFF.filter((s) => s.userId === u.id);
    if (!staff.length) {
      return this.i18n.t('login.role.staff');
    }
    if (staff.some((s) => s.role === 'MANAGER')) {
      return this.i18n.t('login.role.manager');
    }
    if (staff.every((s) => s.role === 'ACCOUNTANT' || s.role === 'RECEPTIONIST')) {
      return this.i18n.t('login.role.accountant');
    }
    return this.i18n.t('login.role.staff');
  }

  pickDemo(email: string): void {
    this.form.patchValue({ email, password: MOCK_SEED_LOGIN_PASSWORD });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigateByUrl('/'),
      error: () => {
        this.loading.set(false);
        this.error.set(this.i18n.t('login.invalidCreds'));
      },
    });
  }
}
