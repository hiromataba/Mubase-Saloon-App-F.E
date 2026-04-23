/** Domain types aligned with the NestJS/Prisma backend for easy API swap later. */

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

export type BranchStaffRole = 'MANAGER' | 'ACCOUNTANT' | 'RECEPTIONIST';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  /** Optional portrait URL; when absent, UI uses a deterministic default avatar. */
  photoUrl?: string | null;
  isOwner: boolean;
  isActive: boolean;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface BranchStaff {
  id: string;
  userId: string;
  branchId: string;
  role: BranchStaffRole;
}

export interface BarberProfile {
  id: string;
  userId: string;
  branchId: string;
  displayName: string;
  commissionPercent: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  branchId: string;
  name: string;
  description?: string | null;
  basePrice: number;
  durationMin?: number | null;
  isActive: boolean;
}

export interface Customer {
  id: string;
  branchId: string;
  fullName: string;
  phone?: string | null;
  whatsapp?: string | null;
  notes?: string | null;
}

export interface Transaction {
  id: string;
  branchId: string;
  barberProfileId: string;
  serviceId: string | null;
  customerId: string | null;
  customerNameSnapshot: string;
  customerPhoneSnapshot?: string | null;
  customerWhatsappSnapshot?: string | null;
  serviceNameSnapshot: string;
  totalAmount: number;
  commissionPercentSnapshot: number;
  barberEarning: number;
  shopEarning: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  notes?: string | null;
  recordedByUserId?: string | null;
}

export interface Receipt {
  id: string;
  transactionId: string;
  branchId: string;
  receiptNumber: string;
  issuedAt: string;
}

export interface OwnerDashboardTotals {
  transactionCount: number;
  revenue: number;
  barberEarnings: number;
  shopEarnings: number;
}

export interface OwnerDashboardBranchRow {
  branch: Branch;
  transactionCount: number;
  revenue: number;
  barberEarnings: number;
  shopEarnings: number;
}

export interface OwnerDashboardBarberRow {
  barber: BarberProfile;
  branch: Branch;
  servicesCount: number;
  revenue: number;
  barberEarnings: number;
}

export interface BarberDashboardSummary {
  servicesCount: number;
  grossServiceTotal: number;
  yourEarnings: number;
}

export interface TransactionListItem extends Transaction {
  branch: Branch;
  barber: Pick<BarberProfile, 'id' | 'displayName'>;
  receipt?: Receipt | null;
}
