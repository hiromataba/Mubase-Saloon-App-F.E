import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { delay, Observable, of, switchMap, throwError } from 'rxjs';
import type { AuthSessionUser } from '../../data/models/session.types';
import { MockDatabaseService } from '../../data/services/mock-database.service';
import type { AppWorkspace } from './workspace';
import {
  canManageBusiness,
  canRecordSales,
  canUseAccountantDesk,
  canViewManagementDashboard,
  resolveWorkspace,
  workspaceLabel,
} from './workspace';

const TOKEN_KEY = 'mubase_access_token';
const USER_KEY = 'mubase_user';

/** Mock auth only — swap this service for a real HTTP implementation later. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly db = inject(MockDatabaseService);

  private readonly token = signal<string | null>(this.readToken());
  private readonly user = signal<AuthSessionUser | null>(this.readUser());

  readonly isLoggedIn = computed(() => !!this.token());
  readonly currentUser = computed(() => this.user());

  readonly workspace = computed((): AppWorkspace | null => resolveWorkspace(this.user()));

  readonly workspaceDisplay = computed(() => workspaceLabel(this.workspace()));

  /** Barber profile only, no staff assignments (typical barber login). */
  readonly isBarberOnly = computed(() => {
    const u = this.user();
    if (!u) {
      return false;
    }
    return !!u.barberProfileId && !u.isOwner && u.staffBranches.length === 0;
  });

  readonly isPureAccountant = computed(() => this.workspace() === 'accountant');

  readonly isManagerWorkspace = computed(() => this.workspace() === 'manager');

  readonly canOperateFrontDesk = computed(() => canRecordSales(this.user()));

  /** Owner-only catalog, branches, CRM, staff admin. */
  readonly canManageBusiness = computed(() => canManageBusiness(this.user()));

  readonly canViewOwnerDashboard = computed(() => this.workspace() === 'owner');

  readonly canViewManagementDashboard = computed(() => canViewManagementDashboard(this.user()));

  readonly canUseAccountantDesk = computed(() => canUseAccountantDesk(this.user()));

  readonly canManageBarbers = computed(() => !!this.user()?.isOwner);

  readonly canViewBarbersDirectory = computed(() => {
    const w = this.workspace();
    return w === 'owner' || w === 'manager';
  });

  login(email: string, password: string): Observable<{ accessToken: string; user: AuthSessionUser }> {
    return of(true).pipe(
      delay(280),
      switchMap(() => {
        const mockUser = this.db.findUserByEmail(email);
        if (!mockUser || !mockUser.isActive || password.length < 8) {
          return throwError(() => new Error('Invalid credentials'));
        }
        const session = this.db.buildSessionFromUser(mockUser);
        const accessToken = `mock.${btoa(`${session.id}:${Date.now()}`)}`;
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(session));
        this.token.set(accessToken);
        this.user.set(session);
        return of({ accessToken, user: session });
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    void this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.token();
  }

  /** Default landing route after login or when a page is forbidden. */
  homePath(): string {
    switch (this.workspace()) {
      case 'barber':
        return '/my-desk';
      case 'accountant':
        return '/accountant-desk';
      default:
        return '/dashboard';
    }
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthSessionUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as AuthSessionUser;
      const live = this.db.findUserByEmail(parsed.email);
      if (live) {
        return this.db.buildSessionFromUser(live);
      }
      if (!parsed.photoUrl && parsed.id) {
        return { ...parsed, photoUrl: this.db.resolveUserPhotoUrl(parsed.id) };
      }
      if (!parsed.photoUrl) {
        return { ...parsed, photoUrl: this.db.resolveUserPhotoUrl(parsed.email) };
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
