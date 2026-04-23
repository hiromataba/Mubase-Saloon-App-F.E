import type { AuthSessionUser } from '../data/models/session.types';
import type { AppWorkspace } from '../core/auth/workspace';
import { resolveWorkspace } from '../core/auth/workspace';

export interface ShellNavItem {
  label: string;
  path: string;
  icon: 'layout' | 'user' | 'building' | 'scissors' | 'clipboard' | 'users' | 'credit' | 'settings' | 'sparkles';
  /**
   * If set, only these workspaces see the item.
   * If omitted, any authenticated user with shell access sees it (e.g. Settings, Transactions).
   */
  workspaces?: AppWorkspace[];
}

export const SHELL_NAV: ShellNavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'layout', workspaces: ['owner', 'manager'] },
  { label: 'Front desk', path: '/accountant-desk', icon: 'clipboard', workspaces: ['accountant'] },
  { label: 'My desk', path: '/my-desk', icon: 'user', workspaces: ['barber'] },
  { label: 'Staff', path: '/staff', icon: 'users', workspaces: ['owner'] },
  { label: 'Branches', path: '/branches', icon: 'building', workspaces: ['owner'] },
  { label: 'Barbers', path: '/barbers', icon: 'scissors', workspaces: ['owner', 'manager'] },
  { label: 'Services', path: '/services', icon: 'sparkles', workspaces: ['owner'] },
  { label: 'Customers', path: '/customers', icon: 'users', workspaces: ['owner'] },
  { label: 'Transactions', path: '/transactions', icon: 'credit' },
  { label: 'Sale form (page)', path: '/operations', icon: 'clipboard', workspaces: ['owner', 'manager', 'accountant'] },
  { label: 'Settings', path: '/settings', icon: 'settings' },
];

export function filterNavForUser(user: AuthSessionUser | null): ShellNavItem[] {
  if (!user) {
    return [];
  }
  const w = resolveWorkspace(user);
  if (!w) {
    return [];
  }
  return SHELL_NAV.filter((item) => {
    if (!item.workspaces?.length) {
      return true;
    }
    return item.workspaces.includes(w);
  });
}
