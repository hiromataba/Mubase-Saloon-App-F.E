import type { AuthSessionUser } from '../data/models/session.types';
import type { AppWorkspace } from '../core/auth/workspace';
import { resolveWorkspace } from '../core/auth/workspace';

export interface ShellNavItem {
  /** Key in {@link ../../core/locale/i18n.dictionary I18N} */
  labelKey: string;
  path: string;
  icon: 'layout' | 'user' | 'building' | 'scissors' | 'clipboard' | 'users' | 'credit' | 'settings' | 'sparkles';
  /**
   * If set, only these workspaces see the item.
   * If omitted, any authenticated user with shell access sees the item (e.g. Settings, Transactions).
   */
  workspaces?: AppWorkspace[];
}

export const SHELL_NAV: ShellNavItem[] = [
  {
    labelKey: 'nav.dashboard',
    path: '/dashboard',
    icon: 'layout',
    workspaces: ['owner', 'manager'],
  },
  {
    labelKey: 'nav.frontDesk',
    path: '/accountant-desk',
    icon: 'clipboard',
    workspaces: ['accountant'],
  },
  {
    labelKey: 'nav.myDesk',
    path: '/my-desk',
    icon: 'user',
    workspaces: ['barber'],
  },
  {
    labelKey: 'nav.staff',
    path: '/staff',
    icon: 'users',
    workspaces: ['owner'],
  },
  {
    labelKey: 'nav.branches',
    path: '/branches',
    icon: 'building',
    workspaces: ['owner'],
  },
  {
    labelKey: 'nav.barbers',
    path: '/barbers',
    icon: 'scissors',
    workspaces: ['owner', 'manager'],
  },
  {
    labelKey: 'nav.services',
    path: '/services',
    icon: 'sparkles',
    workspaces: ['owner'],
  },
  {
    labelKey: 'nav.customers',
    path: '/customers',
    icon: 'users',
    workspaces: ['owner', 'manager', 'accountant'],
  },
  { labelKey: 'nav.transactions', path: '/transactions', icon: 'credit' },
  {
    labelKey: 'nav.saleForm',
    path: '/operations',
    icon: 'clipboard',
    workspaces: ['owner', 'manager', 'accountant'],
  },
  { labelKey: 'nav.settings', path: '/settings', icon: 'settings' },
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
