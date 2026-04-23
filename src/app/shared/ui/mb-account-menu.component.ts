import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import type { AppWorkspace } from '../../core/auth/workspace';
import { WorkspaceBrandingService } from '../../core/branding/workspace-branding.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { MbAvatarComponent } from './mb-avatar.component';
import { MbButtonComponent } from './mb-button.component';

export interface MbAccountMenuItem {
  path: string;
  label: string;
  hint: string;
  /** Tailwind bg class for icon tile */
  iconBg: string;
  iconStroke: string;
  svgPath: string;
}

@Component({
  selector: 'mb-account-menu',
  standalone: true,
  imports: [RouterLink, MbAvatarComponent, MbButtonComponent],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-[var(--mb-backdrop)]/40 p-4 backdrop-blur-sm"
        (click)="close.emit()"
      >
        <div
          class="pointer-events-auto my-auto w-full max-w-[22rem] rounded-3xl border border-mb-border bg-mb-surface shadow-modal max-h-[min(90dvh,36rem)] overflow-y-auto dark:shadow-modal-dark"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mb-account-title"
          (click)="$event.stopPropagation()"
        >
        <div class="border-b border-mb-border p-5 sm:p-6">
          <div class="flex gap-4">
            <div class="relative shrink-0">
              @if (showWorkspaceLogo()) {
                <img
                  [src]="branding.logoDataUrl()!"
                  alt=""
                  class="h-14 w-14 rounded-2xl border border-mb-border bg-mb-elevated object-cover shadow-sm"
                />
              } @else {
                <mb-avatar [label]="user()!.fullName" [photoUrl]="user()!.photoUrl" size="lg" />
              }
            </div>
            <div class="min-w-0 flex-1">
              <p id="mb-account-title" class="font-display text-sm font-bold uppercase tracking-wide text-mb-text-primary">
                {{ orgTitle() }}
              </p>
              <p class="mt-1 text-base font-semibold text-mb-text-primary">{{ user()!.fullName }}</p>
              <p class="mt-2 flex items-center gap-1.5 text-xs text-mb-text-secondary">
                <svg class="h-3.5 w-3.5 shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span class="truncate">{{ user()!.email }}</span>
              </p>
            </div>
          </div>
        </div>

        <nav class="max-h-[min(50vh,22rem)] overflow-y-auto px-2 py-2" aria-label="Account">
          @for (item of menuItems(); track item.path) {
            <a
              [routerLink]="item.path"
              class="mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--mb-hover-row)] active:bg-[var(--mb-primary-soft)]"
              (click)="close.emit()"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mb-border/60"
                [class]="item.iconBg"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" [class]="item.iconStroke">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.svgPath" />
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-mb-text-primary">{{ item.label }}</p>
                <p class="text-xs text-mb-text-secondary">{{ item.hint }}</p>
              </div>
              <svg
                class="h-4 w-4 shrink-0 text-mb-text-secondary opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          }
        </nav>

        <div class="border-t border-mb-border p-4 sm:p-5">
          <mb-btn class="w-full justify-center" (click)="logout()">
            <span class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Log out
            </span>
          </mb-btn>
        </div>
        </div>
      </div>
    }
  `,
})
export class MbAccountMenuComponent {
  readonly open = input(false);
  readonly close = output<void>();

  readonly auth = inject(AuthService);
  readonly branding = inject(WorkspaceBrandingService);
  private readonly db = inject(MockDatabaseService);

  readonly user = computed(() => this.auth.currentUser());

  readonly orgTitle = computed(() => {
    const u = this.user();
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

  readonly showWorkspaceLogo = computed(() => {
    const u = this.user();
    return !!(u?.isOwner && this.branding.logoDataUrl());
  });

  readonly menuItems = computed((): MbAccountMenuItem[] => {
    const u = this.user();
    if (!u) {
      return [];
    }
    const w = this.auth.workspace() as AppWorkspace | null;
    const rows: MbAccountMenuItem[] = [
      {
        path: '/settings',
        label: 'Settings',
        hint: 'Profile & workspace',
        iconBg: 'bg-sky-500/12 dark:bg-sky-400/15',
        iconStroke: 'text-sky-600 dark:text-sky-300',
        svgPath:
          'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      },
    ];

    if (w === 'owner' || w === 'manager') {
      rows.push({
        path: '/dashboard',
        label: 'Dashboard',
        hint: 'Overview & performance',
        iconBg: 'bg-violet-500/12 dark:bg-violet-400/15',
        iconStroke: 'text-violet-600 dark:text-violet-300',
        svgPath:
          'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
      });
    } else if (w === 'barber') {
      rows.push({
        path: '/my-desk',
        label: 'My desk',
        hint: 'Earnings & activity',
        iconBg: 'bg-emerald-500/12 dark:bg-emerald-400/15',
        iconStroke: 'text-emerald-600 dark:text-emerald-300',
        svgPath:
          'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      });
    } else if (w === 'accountant') {
      rows.push({
        path: '/accountant-desk',
        label: 'Front desk',
        hint: 'Checkout & receipts',
        iconBg: 'bg-amber-500/12 dark:bg-amber-400/15',
        iconStroke: 'text-amber-700 dark:text-amber-300',
        svgPath:
          'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      });
    }

    rows.push({
      path: '/transactions',
      label: 'Transactions',
      hint: 'Sales & receipt history',
      iconBg: 'bg-[var(--mb-primary-soft)]',
      iconStroke: 'text-mb-primary',
      svgPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    });

    if (w === 'owner') {
      rows.push({
        path: '/staff',
        label: 'Staff',
        hint: 'People & branch access',
        iconBg: 'bg-indigo-500/12 dark:bg-indigo-400/15',
        iconStroke: 'text-indigo-600 dark:text-indigo-300',
        svgPath:
          'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      });
    } else if (w === 'manager') {
      rows.push({
        path: '/barbers',
        label: 'Barbers',
        hint: 'Roster & commissions',
        iconBg: 'bg-rose-500/12 dark:bg-rose-400/15',
        iconStroke: 'text-rose-600 dark:text-rose-300',
        svgPath:
          'M14.121 14.121L19 19m-4.879-4.879L12 12m4.121 4.121l4.879 4.879M12 12L7.879 7.879M12 12l-4.121 4.121',
      });
    }

    return rows;
  });

  logout(): void {
    this.close.emit();
    this.auth.logout();
  }
}
