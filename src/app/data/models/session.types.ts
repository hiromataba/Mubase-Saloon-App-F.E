import type { BranchStaffRole } from './domain.types';

/** JWT/session shape matching future API `AuthSessionUser`. */
export interface AuthSessionUser {
  id: string;
  email: string;
  fullName: string;
  /** Resolved display photo for the signed-in user (custom or default). */
  photoUrl: string;
  isOwner: boolean;
  isActive: boolean;
  barberProfileId: string | null;
  barberBranchId: string | null;
  staffBranches: { branchId: string; role: BranchStaffRole }[];
}
