import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { AppWorkspace } from './workspace';
import { resolveWorkspace } from './workspace';
import { AuthService } from './auth.service';

/** Redirects to home if current workspace is not allowed. */
export function roleGuard(allowed: AppWorkspace[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const u = auth.currentUser();
    const w = resolveWorkspace(u);
    if (w && allowed.includes(w)) {
      return true;
    }
    return router.createUrlTree([auth.homePath()]);
  };
}
