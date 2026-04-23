import { NgClass } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { WorkspaceBrandingService } from '../core/branding/workspace-branding.service';
import { LocaleService } from '../core/locale/locale.service';
import { LayoutService } from '../core/layout/layout.service';
import { ThemeService } from '../core/theme/theme.service';
import { MockDatabaseService } from '../data/services/mock-database.service';
import { NewSaleModalComponent } from '../features/operations/new-sale-modal.component';
import { NewSaleModalService } from '../features/operations/new-sale-modal.service';
import { MbAccountMenuComponent } from '../shared/ui/mb-account-menu.component';
import { MbAvatarComponent } from '../shared/ui/mb-avatar.component';
import { MbBadgeComponent } from '../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../shared/ui/mb-button.component';
import { filterNavForUser, type ShellNavItem } from './shell-nav';

type QuickAction =
  | { label: string; path: string }
  | { label: string; action: 'sale' }
  | { label: string; action: 'whatsapp' };

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgClass,
    MbButtonComponent,
    MbBadgeComponent,
    MbAvatarComponent,
    MbAccountMenuComponent,
    NewSaleModalComponent,
  ],
  template: `
    <div class="flex min-h-screen bg-mb-bg">
      @if (mobileNav()) {
        <button
          type="button"
          class="fixed inset-0 z-40 bg-[var(--mb-backdrop)] backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          (click)="mobileNav.set(false)"
        ></button>
      }

      <aside
        [ngClass]="
          mobileNav()
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        "
        class="fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r border-mb-border bg-mb-surface/95 backdrop-blur-md transition-transform duration-200 ease-out lg:static lg:z-0"
      >
        <div class="flex h-[4.25rem] items-center gap-3 border-b border-mb-border px-5">
          @if (branding.logoDataUrl(); as logo) {
            <img
              [src]="logo"
              alt=""
              class="h-10 w-10 shrink-0 rounded-xl border border-mb-border bg-mb-elevated object-cover shadow-sm"
            />
          } @else {
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-md shadow-blue-900/20 dark:from-indigo-400 dark:to-violet-500 dark:shadow-violet-900/25"
            >
              M
            </div>
          }
          <div class="min-w-0">
            <p class="truncate font-display text-sm font-semibold tracking-tight text-mb-text-primary">
              {{ branding.workspaceTitle() }}
            </p>
            <p class="truncate text-xs font-medium text-mb-text-secondary">Salon ops</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          @for (item of navItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="border-l-mb-primary bg-[var(--mb-sidebar-active-bg)] text-mb-text-primary shadow-sm"
              [routerLinkActiveOptions]="{ exact: exactNavMatch(item.path) }"
              class="flex items-center gap-3 rounded-xl border-l-2 border-transparent py-2.5 pl-3 pr-3 text-sm font-medium text-mb-text-secondary transition duration-150 hover:bg-[var(--mb-hover-row)] hover:text-mb-text-primary"
              (click)="mobileNav.set(false)"
            >
              @switch (item.icon) {
                @case ('layout') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                }
                @case ('user') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                @case ('building') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                @case ('scissors') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-4.879-4.879L12 12m4.121 4.121l4.879 4.879M12 12L7.879 7.879M12 12l-4.121 4.121" />
                  </svg>
                }
                @case ('clipboard') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                @case ('users') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                @case ('credit') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
                @case ('settings') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                @case ('sparkles') {
                  <svg class="h-5 w-5 shrink-0 text-mb-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                }
              }
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="border-t border-mb-border p-4">
          <button
            type="button"
            class="flex w-full min-w-0 items-center gap-3 rounded-xl border border-mb-border bg-mb-elevated/40 px-3 py-3 text-left transition hover:border-mb-primary/40 hover:bg-[var(--mb-hover-row)] dark:bg-mb-elevated/50"
            (click)="openAccountMenu(); mobileNav.set(false)"
          >
            @if (auth.currentUser(); as u) {
              <mb-avatar [label]="u.fullName" [photoUrl]="u.photoUrl" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-mb-text-primary">{{ u.fullName }}</p>
                <p class="truncate text-xs text-mb-text-secondary">{{ headerOrgLabel() }}</p>
              </div>
            }
          </button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col lg:pl-0">
        <header
          class="sticky top-0 z-30 flex h-[4.25rem] items-center justify-between gap-4 border-b border-mb-border bg-mb-surface/85 px-4 backdrop-blur-lg lg:px-9"
        >
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="rounded-lg p-2 text-mb-text-secondary hover:bg-[var(--mb-hover-row)] lg:hidden"
              (click)="toggleMobileNav()"
              aria-label="Menu"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div class="hidden sm:block">
              <p class="text-xs font-medium uppercase tracking-wide text-mb-primary">
                Internal
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-display text-lg font-semibold text-mb-text-primary">Control center</p>
                @if (auth.workspace()) {
                  <mb-badge tone="neutral" class="!text-[10px]">{{ auth.workspaceDisplay() }}</mb-badge>
                }
              </div>
            </div>
          </div>
          <div class="flex min-w-0 items-center gap-2">
            <div
              class="flex shrink-0 items-center rounded-xl border border-mb-border bg-mb-elevated/50 p-0.5 shadow-sm"
              role="group"
              aria-label="Language"
            >
              <button
                type="button"
                class="rounded-lg px-2 py-1.5 text-[10px] font-semibold transition sm:px-2.5 sm:text-xs"
                [class.bg-mb-surface]="locale.locale() === 'en'"
                [class.text-mb-text-primary]="locale.locale() === 'en'"
                [class.shadow-sm]="locale.locale() === 'en'"
                [class.text-mb-text-secondary]="locale.locale() !== 'en'"
                (click)="locale.setLocale('en')"
              >
                EN
              </button>
              <button
                type="button"
                class="rounded-lg px-2 py-1.5 text-[10px] font-semibold transition sm:px-2.5 sm:text-xs"
                [class.bg-mb-surface]="locale.locale() === 'fr'"
                [class.text-mb-text-primary]="locale.locale() === 'fr'"
                [class.shadow-sm]="locale.locale() === 'fr'"
                [class.text-mb-text-secondary]="locale.locale() !== 'fr'"
                (click)="locale.setLocale('fr')"
              >
                FR
              </button>
            </div>
            @if (auth.canOperateFrontDesk()) {
              <mb-btn size="sm" class="hidden sm:inline-flex" (click)="saleModal.openModal()">New sale</mb-btn>
            }
            @if (auth.isPureAccountant()) {
              <a
                routerLink="/transactions"
                class="hidden items-center justify-center rounded-xl border border-mb-border bg-mb-surface px-4 py-2 text-sm font-medium text-mb-text-primary shadow-sm transition hover:bg-mb-elevated md:inline-flex"
              >
                Receipts
              </a>
            }
            <button
              type="button"
              class="shrink-0 rounded-xl border border-mb-border bg-mb-surface p-2.5 text-mb-text-secondary shadow-sm transition hover:bg-mb-elevated hover:text-mb-text-primary"
              (click)="theme.toggleLightDark()"
              [title]="theme.isDarkEffective() ? 'Light mode' : 'Dark mode'"
            >
              @if (theme.isDarkEffective()) {
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>
            @if (auth.currentUser(); as u) {
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-mb-border bg-mb-surface p-0 shadow-sm transition hover:border-mb-primary/40 hover:bg-[var(--mb-hover-row)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mb-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-mb-surface dark:bg-mb-elevated"
                (click)="openAccountMenu()"
                aria-haspopup="dialog"
                [attr.aria-expanded]="accountMenuOpen()"
                [attr.aria-label]="'Account menu for ' + u.fullName"
                [title]="u.fullName + ' · ' + headerOrgLabel()"
              >
                <mb-avatar [label]="u.fullName" [photoUrl]="u.photoUrl" size="md" />
              </button>
            }
          </div>
        </header>

        <main
          class="min-w-0 max-w-full flex-1 overflow-y-auto p-5 sm:p-6 lg:px-10 lg:py-9 xl:px-14 xl:py-10"
          [ngClass]="layout.isMobile() ? 'pb-36' : ''"
        >
          <router-outlet />
        </main>
      </div>
    </div>

    @if (layout.isMobile()) {
      <div
        class="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden"
        style="padding-bottom: env(safe-area-inset-bottom, 0px)"
      >
        <div class="pointer-events-auto px-3 pb-1">
          <div
            class="mb-2 flex gap-2 overflow-x-auto rounded-2xl border border-mb-border bg-mb-surface/95 px-2 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:shadow-black/45"
          >
            @for (q of quickActions(); track q.label) {
              @if (isSaleAction(q)) {
                <button
                  type="button"
                  class="shrink-0 rounded-xl bg-mb-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm active:scale-[0.98]"
                  (click)="saleModal.openModal()"
                >
                  {{ q.label }}
                </button>
              } @else if (isWhatsappAction(q)) {
                <a
                  routerLink="/transactions"
                  class="shrink-0 rounded-xl border border-mb-border bg-[var(--mb-primary-soft)] px-3.5 py-2 text-xs font-semibold text-mb-primary shadow-sm"
                >
                  {{ q.label }}
                </a>
              } @else {
                <a
                  [routerLink]="q.path"
                  class="shrink-0 rounded-xl border border-mb-border bg-mb-surface px-3.5 py-2 text-xs font-medium text-mb-text-primary shadow-sm"
                >
                  {{ q.label }}
                </a>
              }
            }
          </div>
          <nav
            class="flex h-[3.75rem] items-stretch justify-around gap-0.5 rounded-2xl border border-mb-border bg-mb-surface/95 px-1 py-0.5 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:shadow-black/45"
            aria-label="Primary"
          >
            @for (tab of mobileTabs(); track tab.path) {
              <a
                [routerLink]="tab.path"
                routerLinkActive="bg-[var(--mb-primary-soft)] text-mb-primary"
                [routerLinkActiveOptions]="{ exact: exactNavMatch(tab.path) }"
                class="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold text-mb-text-secondary transition active:scale-[0.97]"
              >
                @switch (tab.icon) {
                  @case ('layout') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  }
                  @case ('user') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  @case ('clipboard') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                  @case ('scissors') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-4.879-4.879L12 12m4.121 4.121l4.879 4.879M12 12L7.879 7.879M12 12l-4.121 4.121" />
                    </svg>
                  }
                  @case ('building') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  @case ('credit') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  }
                  @case ('users') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                  @case ('settings') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  @case ('sparkles') {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  }
                }
                <span class="truncate px-0.5">{{ tab.label }}</span>
              </a>
            }
          </nav>
        </div>
      </div>
    }

    <mb-account-menu [open]="accountMenuOpen()" (close)="closeAccountMenu()" />

    <app-new-sale-modal />
  `,
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly locale = inject(LocaleService);
  readonly theme = inject(ThemeService);
  readonly layout = inject(LayoutService);
  readonly saleModal = inject(NewSaleModalService);
  readonly branding = inject(WorkspaceBrandingService);
  private readonly db = inject(MockDatabaseService);
  readonly mobileNav = signal(false);
  readonly accountMenuOpen = signal(false);

  readonly headerOrgLabel = computed(() => {
    const u = this.auth.currentUser();
    if (!u) {
      return this.branding.workspaceTitle();
    }
    if (u.isOwner) {
      return this.branding.workspaceTitle();
    }
    if (u.barberBranchId) {
      return this.db.getBranch(u.barberBranchId)?.name ?? this.branding.workspaceTitle();
    }
    const first = u.staffBranches[0];
    if (first) {
      return this.db.getBranch(first.branchId)?.name ?? this.branding.workspaceTitle();
    }
    return this.branding.workspaceTitle();
  });

  readonly navItems = computed(() => filterNavForUser(this.auth.currentUser()));

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && this.accountMenuOpen()) {
      this.closeAccountMenu();
    }
  }

  openAccountMenu(): void {
    this.accountMenuOpen.set(true);
  }

  closeAccountMenu(): void {
    this.accountMenuOpen.set(false);
  }

  readonly mobileTabs = computed((): { label: string; path: string; icon: ShellNavItem['icon'] }[] => {
    const u = this.auth.currentUser();
    if (!u) {
      return [];
    }
    const w = this.auth.workspace();
    if (w === 'barber') {
      return [
        { label: 'Desk', path: '/my-desk', icon: 'user' },
        { label: 'Sales', path: '/transactions', icon: 'credit' },
        { label: 'Settings', path: '/settings', icon: 'settings' },
      ];
    }
    if (w === 'accountant') {
      return [
        { label: 'Desk', path: '/accountant-desk', icon: 'clipboard' },
        { label: 'Sales', path: '/transactions', icon: 'credit' },
        { label: 'Settings', path: '/settings', icon: 'settings' },
      ];
    }
    if (w === 'manager') {
      return [
        { label: 'Home', path: '/dashboard', icon: 'layout' },
        { label: 'Barbers', path: '/barbers', icon: 'scissors' },
        { label: 'Sales', path: '/transactions', icon: 'credit' },
        { label: 'Settings', path: '/settings', icon: 'settings' },
      ];
    }
    return [
      { label: 'Home', path: '/dashboard', icon: 'layout' },
      { label: 'Staff', path: '/staff', icon: 'users' },
      { label: 'Sales', path: '/transactions', icon: 'credit' },
      { label: 'More', path: '/settings', icon: 'settings' },
    ];
  });

  readonly quickActions = computed((): QuickAction[] => {
    const u = this.auth.currentUser();
    if (!u) {
      return [];
    }
    const w = this.auth.workspace();
    if (w === 'barber') {
      return [
        { label: 'My earnings', path: '/my-desk' },
        { label: 'My activity', path: '/transactions' },
        { label: 'Profile', path: '/settings' },
      ];
    }
    if (w === 'accountant') {
      return [
        { label: 'New sale', action: 'sale' },
        { label: 'Receipts', path: '/transactions' },
        { label: 'WhatsApp', action: 'whatsapp' },
      ];
    }
    if (w === 'manager') {
      return [
        { label: 'New sale', action: 'sale' },
        { label: 'Barbers', path: '/barbers' },
        { label: 'Sales', path: '/transactions' },
        { label: 'Reports', path: '/dashboard' },
      ];
    }
    if (w === 'owner') {
      return [
        { label: 'New sale', action: 'sale' },
        { label: 'Add branch', path: '/branches' },
        { label: 'Add staff', path: '/staff' },
        { label: 'Add barber', path: '/barbers' },
      ];
    }
    return [];
  });

  exactNavMatch(path: string): boolean {
    return ['/dashboard', '/my-desk', '/accountant-desk'].includes(path);
  }

  isSaleAction(q: QuickAction): q is { label: string; action: 'sale' } {
    return 'action' in q && q.action === 'sale';
  }

  isWhatsappAction(q: QuickAction): q is { label: string; action: 'whatsapp' } {
    return 'action' in q && q.action === 'whatsapp';
  }

  toggleMobileNav(): void {
    this.mobileNav.update((v) => !v);
  }
}
