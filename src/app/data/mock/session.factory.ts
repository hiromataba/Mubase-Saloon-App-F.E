import type { AuthSessionUser } from '../models/session.types';
import type { User } from '../models/domain.types';
import { bundledAvatarUrl } from '../../shared/display/avatar-url.util';
import { MOCK_BARBER_PROFILES, MOCK_BRANCH_STAFF, MOCK_USERS } from './mock-seed';

/**
 * Static session helpers for tests or tooling only.
 * The app uses `MockDatabaseService.findUserByEmail` + `buildSessionFromUser` so staff/barber links follow CRUD.
 */
export function findMockUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.email.toLowerCase() === normalized);
}

export function buildAuthSession(user: User): AuthSessionUser {
  const barber = MOCK_BARBER_PROFILES.find((b) => b.userId === user.id);
  const staff = MOCK_BRANCH_STAFF.filter((s) => s.userId === user.id).map((s) => ({
    branchId: s.branchId,
    role: s.role,
  }));
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    photoUrl: user.photoUrl?.trim() || bundledAvatarUrl(user.id),
    isOwner: user.isOwner,
    isActive: user.isActive,
    barberProfileId: barber?.id ?? null,
    barberBranchId: barber?.branchId ?? null,
    staffBranches: staff,
  };
}
