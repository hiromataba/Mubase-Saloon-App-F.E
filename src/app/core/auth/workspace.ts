import type { BranchStaffRole } from '../../data/models/domain.types';
import type { AuthSessionUser } from '../../data/models/session.types';

/** High-level workspace drives navigation and page access (single business, multiple shops). */
export type AppWorkspace = 'owner' | 'manager' | 'accountant' | 'barber';

const OPS_ROLES: BranchStaffRole[] = ['MANAGER', 'ACCOUNTANT', 'RECEPTIONIST'];

function isBarberOnly(user: AuthSessionUser): boolean {
  return !!user.barberProfileId && !user.isOwner && user.staffBranches.length === 0;
}

function hasManagerRole(user: AuthSessionUser): boolean {
  return user.staffBranches.some((s) => s.role === 'MANAGER');
}

function hasOnlyOperationalStaffRoles(user: AuthSessionUser): boolean {
  if (!user.staffBranches.length) {
    return false;
  }
  return user.staffBranches.every((s) => OPS_ROLES.includes(s.role) && s.role !== 'MANAGER');
}

/** Resolves primary workspace: manager beats accountant when both apply. */
export function resolveWorkspace(user: AuthSessionUser | null): AppWorkspace | null {
  if (!user) {
    return null;
  }
  if (user.isOwner) {
    return 'owner';
  }
  if (isBarberOnly(user)) {
    return 'barber';
  }
  if (hasManagerRole(user)) {
    return 'manager';
  }
  if (user.staffBranches.length > 0 && hasOnlyOperationalStaffRoles(user)) {
    return 'accountant';
  }
  if (user.staffBranches.length > 0) {
    return 'accountant';
  }
  return 'barber';
}

export function canRecordSales(user: AuthSessionUser | null): boolean {
  if (!user) {
    return false;
  }
  return user.isOwner || user.staffBranches.length > 0;
}

export function canManageBusiness(user: AuthSessionUser | null): boolean {
  return !!user?.isOwner;
}

export function canViewManagementDashboard(user: AuthSessionUser | null): boolean {
  const w = resolveWorkspace(user);
  return w === 'owner' || w === 'manager';
}

export function canUseAccountantDesk(user: AuthSessionUser | null): boolean {
  return resolveWorkspace(user) === 'accountant';
}

export function workspaceLabel(w: AppWorkspace | null): string {
  switch (w) {
    case 'owner':
      return 'Owner';
    case 'manager':
      return 'Manager';
    case 'accountant':
      return 'Accountant';
    case 'barber':
      return 'Barber';
    default:
      return 'Guest';
  }
}
