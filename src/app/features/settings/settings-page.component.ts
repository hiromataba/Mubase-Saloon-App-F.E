import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/locale/i18n.service';
import { WorkspaceBrandingService } from '../../core/branding/workspace-branding.service';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import { MOCK_DEMO_PASSWORD_HINT } from '../../data/mock/mock-seed';
import { MbAvatarComponent } from '../../shared/ui/mb-avatar.component';
import { MbBadgeComponent } from '../../shared/ui/mb-badge.component';
import { MbButtonComponent } from '../../shared/ui/mb-button.component';
import { MbCardComponent } from '../../shared/ui/mb-card.component';

@Component({
  standalone: true,
  selector: 'app-settings-page',
  imports: [MbCardComponent, MbBadgeComponent, MbButtonComponent, MbAvatarComponent],
  template: `
    <div class="mx-auto max-w-2xl space-y-6 md:space-y-8 lg:space-y-10">
      <div class="mb-page-header">
        <h1 class="mb-page-title">{{ i18n.t('page.settings.title') }}</h1>
        <p class="mb-page-sub">{{ i18n.t('page.settings.subtitle') }}</p>
      </div>

      <!-- Appearance (theme radios + quick toggle) — hidden for now; use header theme control. -->
      <!--
      <mb-card title="Appearance" subtitle="Light, dark, or follow system">
        <div class="space-y-3">
          @for (m of modes; track m.value) {
            <label
              class="flex cursor-pointer items-center justify-between rounded-xl border border-mb-border bg-mb-surface px-4 py-3 transition hover:border-mb-primary dark:bg-mb-surface"
            >
              <div>
                <p class="font-medium text-mb-text-primary">{{ m.label }}</p>
                <p class="text-xs text-mb-text-secondary">{{ m.hint }}</p>
              </div>
              <input
                type="radio"
                name="theme"
                [value]="m.value"
                [ngModel]="theme.preference()"
                (ngModelChange)="onThemeChange($event)"
                class="h-4 w-4 accent-[var(--mb-primary)]"
              />
            </label>
          }
        </div>
        <div class="mt-4 flex gap-2">
          <mb-btn variant="secondary" (click)="theme.toggleLightDark()">Quick toggle</mb-btn>
        </div>
      </mb-card>
      -->

      @if (auth.canManageBusiness()) {
        <mb-card [title]="i18n.t('page.settings.brandTitle')" [subtitle]="i18n.t('page.settings.brandSub')">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div class="flex shrink-0 flex-col items-center gap-2">
              @if (branding.logoDataUrl(); as logo) {
                <img
                  [src]="logo"
                  [attr.alt]="i18n.t('page.settings.logoAltPreview')"
                  class="h-24 w-24 rounded-2xl border border-mb-border bg-mb-elevated object-cover shadow-sm"
                />
              } @else {
                <div
                  class="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-mb-border bg-mb-elevated/50 text-xs font-medium text-mb-text-secondary"
                >
                  {{ i18n.t('page.settings.noLogo') }}
                </div>
              }
              <label class="cursor-pointer">
                <span
                  class="inline-flex rounded-xl bg-mb-primary px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                >
                  {{ i18n.t('page.settings.uploadImage') }}
                </span>
                <input type="file" accept="image/*" class="sr-only" (change)="onLogoFile($event)" />
              </label>
              @if (branding.logoDataUrl()) {
                <mb-btn variant="ghost" size="sm" (click)="clearLogo()">{{ i18n.t('page.settings.removeLogo') }}</mb-btn>
              }
            </div>
            <div class="min-w-0 flex-1 space-y-3">
              <div>
                <label class="mt-[7px] block text-[11px] font-semibold uppercase tracking-wide text-mb-text-secondary">
                  {{ i18n.t('page.settings.businessNameLabel') }}
                </label>
                <input
                  type="text"
                  class="mb-input"
                  [attr.placeholder]="i18n.t('page.settings.businessNamePlaceholder')"
                  [value]="branding.businessName() ?? ''"
                  (input)="onBusinessNameInput($event)"
                />
                <p class="mt-1.5 text-xs text-mb-text-secondary">
                  {{ i18n.t('page.settings.businessNameHint') }}
                </p>
              </div>
            </div>
          </div>
        </mb-card>
      }

      <mb-card extraClass="max-lg:mt-8" [title]="i18n.t('page.settings.profileTitle')" [subtitle]="i18n.t('page.settings.profileExtraSub')">
        <div class="mb-6 flex items-center gap-4 border-b border-mb-border pb-6">
          @if (auth.currentUser(); as u) {
            <mb-avatar [label]="u.fullName" [photoUrl]="u.photoUrl" size="lg" />
            <div class="min-w-0">
              <p class="font-semibold text-mb-text-primary">{{ u.fullName }}</p>
              <p class="text-sm text-mb-text-secondary">{{ u.email }}</p>
            </div>
          }
        </div>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-mb-text-secondary">{{ i18n.t('page.settings.dtName') }}</dt>
            <dd class="font-medium text-mb-text-primary">
              {{ auth.currentUser()?.fullName }}
            </dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-mb-text-secondary">{{ i18n.t('page.settings.dtEmail') }}</dt>
            <dd class="font-medium">{{ auth.currentUser()?.email }}</dd>
          </div>
          <div class="flex flex-wrap justify-between gap-4">
            <dt class="text-mb-text-secondary">{{ i18n.t('page.settings.dtWorkspace') }}</dt>
            <dd>
              <mb-badge tone="success">{{ auth.workspaceDisplay() }}</mb-badge>
            </dd>
          </div>
          <div class="flex flex-wrap justify-between gap-4">
            <dt class="text-mb-text-secondary">{{ i18n.t('page.settings.dtAssignments') }}</dt>
            <dd class="flex max-w-[min(100%,20rem)] flex-col items-end gap-1 text-right">
              @if (auth.currentUser()?.isOwner) {
                <mb-badge tone="info">{{ i18n.t('page.settings.badgeOwner') }}</mb-badge>
              }
              @if (auth.currentUser()?.barberProfileId) {
                <mb-badge tone="neutral">{{ i18n.t('page.settings.badgeBarberProfile') }}</mb-badge>
              }
              @for (s of auth.currentUser()?.staffBranches ?? []; track s.branchId + s.role) {
                <mb-badge tone="neutral">{{ i18n.staffRoleLabel(s.role) }} · {{ branchLabel(s.branchId) }}</mb-badge>
              }
              @if (!auth.currentUser()?.isOwner && (auth.currentUser()?.staffBranches?.length ?? 0) === 0 && !auth.currentUser()?.barberProfileId) {
                <span class="text-slate-500">—</span>
              }
            </dd>
          </div>
        </dl>
      </mb-card>

      <!-- <mb-card class="!mt-10 md:!mt-12 lg:!mt-14" title="Demo mode" subtitle="Replacing with API later">
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ demoHint }}</p>
      </mb-card> -->
    </div>
  `,
})
export class SettingsPageComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly branding = inject(WorkspaceBrandingService);
  private readonly db = inject(MockDatabaseService);
  readonly demoHint = MOCK_DEMO_PASSWORD_HINT;

  onBusinessNameInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value.trim();
    this.branding.setBusinessName(v.length ? v : null);
  }

  onLogoFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    if (file.size > 450_000) {
      window.alert(this.i18n.t('page.settings.alertLogoSize'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (): void => {
      const data = reader.result;
      if (typeof data === 'string') {
        this.branding.setLogoDataUrl(data);
      }
    };
    reader.readAsDataURL(file);
  }

  clearLogo(): void {
    this.branding.setLogoDataUrl(null);
  }

  /* Appearance section — restore with ThemeService + FormsModule + MbButtonComponent when uncommenting template block.
  readonly theme = inject(ThemeService);
  readonly modes: { value: 'light' | 'dark' | 'system'; label: string; hint: string }[] = [
    { value: 'light', label: 'Light', hint: 'Bright surfaces, crisp contrast' },
    { value: 'dark', label: 'Dark', hint: 'Low glare for evening shifts' },
    { value: 'system', label: 'System', hint: 'Match OS preference' },
  ];
  onThemeChange(value: string): void {
    if (value === 'light' || value === 'dark' || value === 'system') {
      this.theme.setMode(value);
    }
  }
  */

  branchLabel(branchId: string): string {
    return this.db.getBranch(branchId)?.name ?? branchId;
  }
}
