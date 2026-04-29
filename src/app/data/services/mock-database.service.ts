import { computed, Injectable, signal } from '@angular/core';
import type {
  BarberProfile,
  Branch,
  BranchStaff,
  BranchStaffRole,
  Customer,
  OwnerDashboardBarberRow,
  OwnerDashboardBranchRow,
  OwnerDashboardTotals,
  Receipt,
  Service,
  Transaction,
  TransactionListItem,
  User,
} from '../models/domain.types';
import type { AuthSessionUser } from '../models/session.types';
import {
  MOCK_BARBER_PROFILES,
  MOCK_BRANCH_STAFF,
  MOCK_BRANCHES,
  MOCK_CUSTOMERS,
  MOCK_RECEIPTS,
  MOCK_SERVICES,
  MOCK_TRANSACTIONS,
  MOCK_USERS,
} from '../mock/mock-seed';
import { splitEarnings } from '../mock/earnings.util';
import { bundledAvatarUrl } from '../../shared/display/avatar-url.util';

export interface ChartSeries {
  labels: string[];
  values: number[];
}

@Injectable({ providedIn: 'root' })
export class MockDatabaseService {
  private readonly branchesState = signal<Branch[]>(structuredClone(MOCK_BRANCHES));
  private readonly usersState = signal<User[]>(structuredClone(MOCK_USERS));
  private readonly barbersState = signal<BarberProfile[]>(structuredClone(MOCK_BARBER_PROFILES));
  private readonly servicesState = signal<Service[]>(structuredClone(MOCK_SERVICES));
  private readonly customersState = signal<Customer[]>(structuredClone(MOCK_CUSTOMERS));
  private readonly transactionsState = signal<Transaction[]>(structuredClone(MOCK_TRANSACTIONS));
  private readonly receiptsState = signal<Receipt[]>(structuredClone(MOCK_RECEIPTS));
  private readonly branchStaffState = signal<BranchStaff[]>(structuredClone(MOCK_BRANCH_STAFF));

  private readonly receiptSeqByBranch = signal<Record<string, number>>(this.initReceiptSeq());

  readonly branches = this.branchesState.asReadonly();
  readonly transactions = this.transactionsState.asReadonly();
  readonly users = this.usersState.asReadonly();
  readonly barbers = this.barbersState.asReadonly();
  readonly services = this.servicesState.asReadonly();
  readonly customers = this.customersState.asReadonly();
  readonly branchStaff = this.branchStaffState.asReadonly();

  private initReceiptSeq(): Record<string, number> {
    const m: Record<string, number> = {};
    for (const r of MOCK_RECEIPTS) {
      const part = r.receiptNumber.split('-').pop();
      const n = part ? parseInt(part, 10) : 0;
      m[r.branchId] = Math.max(m[r.branchId] ?? 0, n);
    }
    return m;
  }

  getUserById(id: string): User | undefined {
    return this.usersState().find((u) => u.id === id);
  }

  /** Portrait URL for roster / shell (custom `User.photoUrl` or deterministic default). */
  resolveUserPhotoUrl(userId: string): string {
    const u = this.getUserById(userId);
    const raw = u?.photoUrl?.trim();
    if (raw) {
      return raw;
    }
    return bundledAvatarUrl(userId);
  }

  resolveBarberProfilePhotoUrl(barberProfileId: string): string {
    const b = this.barbersState().find((x) => x.id === barberProfileId);
    if (!b) {
      return bundledAvatarUrl(barberProfileId);
    }
    return this.resolveUserPhotoUrl(b.userId);
  }

  resolveCustomerListPhotoUrl(customerId: string): string {
    return bundledAvatarUrl(`cust-${customerId}`);
  }

  resolveCustomerSnapshotPhotoUrl(customerId: string | null, nameSnapshot: string): string {
    if (customerId) {
      return this.resolveCustomerListPhotoUrl(customerId);
    }
    return bundledAvatarUrl(nameSnapshot || 'guest');
  }

  findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    return this.usersState().find((u) => u.email.toLowerCase() === normalized);
  }

  /** Builds session from current mock state (staff + barber links stay in sync with CRUD). */
  buildSessionFromUser(user: User): AuthSessionUser {
    const barber = this.barbersState().find((b) => b.userId === user.id);
    const staff = this.branchStaffState()
      .filter((s) => s.userId === user.id)
      .map((s) => ({ branchId: s.branchId, role: s.role }));
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      photoUrl: this.resolveUserPhotoUrl(user.id),
      isOwner: user.isOwner,
      isActive: user.isActive,
      barberProfileId: barber?.id ?? null,
      barberBranchId: barber?.branchId ?? null,
      staffBranches: staff,
    };
  }

  getBranch(id: string): Branch | undefined {
    return this.branchesState().find((b) => b.id === id);
  }

  listBranchesVisibleTo(user: AuthSessionUser | null): Branch[] {
    if (!user) {
      return [];
    }
    if (user.isOwner) {
      return [...this.branchesState()].sort((a, b) => a.name.localeCompare(b.name));
    }
    const ids = new Set<string>();
    for (const s of user.staffBranches) {
      ids.add(s.branchId);
    }
    if (user.barberBranchId) {
      ids.add(user.barberBranchId);
    }
    return this.branchesState()
      .filter((b) => ids.has(b.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  listBarbersForBranch(branchId: string, opts?: { includeInactive?: boolean }): BarberProfile[] {
    return this.barbersState().filter(
      (b) => b.branchId === branchId && (opts?.includeInactive || b.isActive),
    );
  }

  listServicesForBranchAll(branchId: string): Service[] {
    return this.servicesState().filter((s) => s.branchId === branchId);
  }

  listServicesForBranch(branchId: string): Service[] {
    return this.servicesState().filter((s) => s.branchId === branchId && s.isActive);
  }

  listStaffForBranch(branchId: string): BranchStaff[] {
    return this.branchStaffState().filter((s) => s.branchId === branchId);
  }

  /**
   * Users who can receive a new assignment at this branch.
   * If `role` is set, excludes users who already have that exact branch+role row (allows manager+accountant same person).
   */
  listUsersAssignableToBranch(branchId: string, role?: BranchStaffRole): User[] {
    return this.usersState().filter((u) => {
      if (u.isOwner || !u.isActive) {
        return false;
      }
      if (role) {
        const hasPair = this.branchStaffState().some(
          (s) => s.userId === u.id && s.branchId === branchId && s.role === role,
        );
        return !hasPair;
      }
      const anyAtBranch = this.branchStaffState().some((s) => s.userId === u.id && s.branchId === branchId);
      return !anyAtBranch;
    });
  }

  listStaffEnriched(): { assignment: BranchStaff; user: User; branch: Branch }[] {
    return this.branchStaffState()
      .map((assignment) => {
        const user = this.getUserById(assignment.userId);
        const branch = this.getBranch(assignment.branchId);
        if (!user || !branch) {
          return null;
        }
        return { assignment, user, branch };
      })
      .filter((x): x is { assignment: BranchStaff; user: User; branch: Branch } => x !== null)
      .sort((a, b) => a.branch.name.localeCompare(b.branch.name) || a.user.fullName.localeCompare(b.user.fullName));
  }

  listCustomersForBranch(branchId: string): Customer[] {
    return this.customersState().filter((c) => c.branchId === branchId);
  }

  getBarber(id: string): BarberProfile | undefined {
    return this.barbersState().find((b) => b.id === id);
  }

  getService(id: string): Service | undefined {
    return this.servicesState().find((s) => s.id === id);
  }

  getReceiptByTransactionId(transactionId: string): Receipt | undefined {
    return this.receiptsState().find((r) => r.transactionId === transactionId);
  }

  enrichTransaction(row: Transaction): TransactionListItem {
    const branch = this.getBranch(row.branchId)!;
    const barber = this.getBarber(row.barberProfileId)!;
    return {
      ...row,
      branch,
      barber: { id: barber.id, displayName: barber.displayName },
      receipt: this.getReceiptByTransactionId(row.id) ?? null,
    };
  }

  listTransactionsFiltered(user: AuthSessionUser | null, opts?: { branchId?: string }): TransactionListItem[] {
    let rows = [...this.transactionsState()].sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    );
    if (!user) {
      return [];
    }
    const allowedBranches = new Set(this.listBranchesVisibleTo(user).map((b) => b.id));
    rows = rows.filter((t) => allowedBranches.has(t.branchId));
    if (user.barberProfileId && !user.isOwner && user.staffBranches.length === 0) {
      rows = rows.filter((t) => t.barberProfileId === user.barberProfileId);
    }
    if (opts?.branchId) {
      rows = rows.filter((t) => t.branchId === opts.branchId);
    }
    return rows.map((t) => this.enrichTransaction(t));
  }

  getOwnerDashboard(): {
    totals: OwnerDashboardTotals;
    byBranch: OwnerDashboardBranchRow[];
    byBarber: OwnerDashboardBarberRow[];
  } {
    const txs = this.transactionsState();
    const totals: OwnerDashboardTotals = {
      transactionCount: txs.length,
      revenue: txs.reduce((s, t) => s + t.totalAmount, 0),
      barberEarnings: txs.reduce((s, t) => s + t.barberEarning, 0),
      shopEarnings: txs.reduce((s, t) => s + t.shopEarning, 0),
    };

    const byBranchMap = new Map<
      string,
      { count: number; revenue: number; barber: number; shop: number }
    >();
    for (const t of txs) {
      const cur = byBranchMap.get(t.branchId) ?? { count: 0, revenue: 0, barber: 0, shop: 0 };
      cur.count += 1;
      cur.revenue += t.totalAmount;
      cur.barber += t.barberEarning;
      cur.shop += t.shopEarning;
      byBranchMap.set(t.branchId, cur);
    }
    const byBranch: OwnerDashboardBranchRow[] = [...byBranchMap.entries()].map(([branchId, v]) => ({
      branch: this.getBranch(branchId)!,
      transactionCount: v.count,
      revenue: v.revenue,
      barberEarnings: v.barber,
      shopEarnings: v.shop,
    }));

    const byBarberMap = new Map<
      string,
      { count: number; revenue: number; barber: number }
    >();
    for (const t of txs) {
      const cur = byBarberMap.get(t.barberProfileId) ?? { count: 0, revenue: 0, barber: 0 };
      cur.count += 1;
      cur.revenue += t.totalAmount;
      cur.barber += t.barberEarning;
      byBarberMap.set(t.barberProfileId, cur);
    }
    const byBarber: OwnerDashboardBarberRow[] = [...byBarberMap.entries()].map(([id, v]) => ({
      barber: this.getBarber(id)!,
      branch: this.getBranch(this.getBarber(id)!.branchId)!,
      servicesCount: v.count,
      revenue: v.revenue,
      barberEarnings: v.barber,
    }));

    byBarber.sort((a, b) => b.revenue - a.revenue);

    return { totals, byBranch, byBarber };
  }

  getBarberDashboard(barberProfileId: string): {
    summary: { servicesCount: number; grossServiceTotal: number; yourEarnings: number };
    recent: TransactionListItem[];
  } {
    const txs = this.transactionsState().filter((t) => t.barberProfileId === barberProfileId);
    const summary = {
      servicesCount: txs.length,
      grossServiceTotal: txs.reduce((s, t) => s + t.totalAmount, 0),
      yourEarnings: txs.reduce((s, t) => s + t.barberEarning, 0),
    };
    const recent = [...txs]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .map((t) => this.enrichTransaction(t));
    return { summary, recent };
  }

  staffPulse(user: AuthSessionUser): TransactionListItem[] {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    return this.listTransactionsFiltered(user).filter(
      (t) => new Date(t.paymentDate) >= since,
    );
  }

  nextReceiptNumber(branchId: string): string {
    const branch = this.getBranch(branchId);
    if (!branch) {
      throw new Error('Unknown branch');
    }
    const year = new Date().getUTCFullYear();
    let next = (this.receiptSeqByBranch()[branchId] ?? 0) + 1;
    this.receiptSeqByBranch.update((m) => ({ ...m, [branchId]: next }));
    return `${branch.code}-${year}-${String(next).padStart(5, '0')}`;
  }

  recordTransaction(input: {
    branchId: string;
    barberProfileId: string;
    serviceId: string | null;
    customerId: string | null;
    customerName: string;
    customerPhone?: string;
    customerWhatsapp?: string;
    serviceName: string;
    totalAmount: number;
    commissionPercent: number;
    paymentMethod: Transaction['paymentMethod'];
    recordedByUserId: string;
  }): TransactionListItem {
    const id = `tx-${crypto.randomUUID().slice(0, 8)}`;
    const { barberEarning, shopEarning } = splitEarnings(input.totalAmount, input.commissionPercent);
    const paymentDate = new Date().toISOString();
    const receiptNumber = this.nextReceiptNumber(input.branchId);
    const tx: Transaction = {
      id,
      branchId: input.branchId,
      barberProfileId: input.barberProfileId,
      serviceId: input.serviceId,
      customerId: input.customerId,
      customerNameSnapshot: input.customerName,
      customerPhoneSnapshot: input.customerPhone ?? null,
      customerWhatsappSnapshot: input.customerWhatsapp ?? null,
      serviceNameSnapshot: input.serviceName,
      totalAmount: input.totalAmount,
      commissionPercentSnapshot: input.commissionPercent,
      barberEarning,
      shopEarning,
      paymentMethod: input.paymentMethod,
      paymentDate,
      notes: null,
      recordedByUserId: input.recordedByUserId,
    };
    const receipt: Receipt = {
      id: `rc-${id}`,
      transactionId: id,
      branchId: input.branchId,
      receiptNumber,
      issuedAt: paymentDate,
    };
    this.transactionsState.update((a) => [tx, ...a]);
    this.receiptsState.update((a) => [receipt, ...a]);
    return this.enrichTransaction(tx);
  }

  deleteTransaction(transactionId: string): void {
    this.transactionsState.update((rows) => rows.filter((t) => t.id !== transactionId));
    this.receiptsState.update((rows) => rows.filter((r) => r.transactionId !== transactionId));
  }

  // --- CRUD: branches ---

  createBranch(input: Omit<Branch, 'id'> & { id?: string }): Branch {
    const id = input.id ?? `br-${crypto.randomUUID().slice(0, 8)}`;
    const row: Branch = {
      id,
      name: input.name,
      code: input.code.toUpperCase().slice(0, 8),
      address: input.address ?? null,
      phone: input.phone ?? null,
      isActive: input.isActive,
    };
    this.branchesState.update((a) => [...a, row]);
    this.receiptSeqByBranch.update((m) => ({ ...m, [id]: m[id] ?? 0 }));
    return row;
  }

  updateBranch(id: string, patch: Partial<Omit<Branch, 'id'>>): Branch | undefined {
    let updated: Branch | undefined;
    this.branchesState.update((rows) =>
      rows.map((b) => {
        if (b.id !== id) {
          return b;
        }
        updated = {
          ...b,
          ...patch,
          code: patch.code !== undefined ? patch.code.toUpperCase().slice(0, 8) : b.code,
        };
        return updated;
      }),
    );
    return updated;
  }

  setBranchActive(id: string, isActive: boolean): void {
    this.updateBranch(id, { isActive });
  }

  // --- CRUD: users + barbers ---

  createUser(input: Omit<User, 'id'> & { id?: string }): User {
    const id = input.id ?? `usr-${crypto.randomUUID().slice(0, 8)}`;
    const row: User = {
      id,
      email: input.email.trim().toLowerCase(),
      fullName: input.fullName,
      phone: input.phone ?? null,
      photoUrl: input.photoUrl?.trim() || bundledAvatarUrl(id),
      isOwner: input.isOwner,
      isActive: input.isActive,
    };
    this.usersState.update((a) => [...a, row]);
    return row;
  }

  updateUser(id: string, patch: Partial<Omit<User, 'id'>>): void {
    this.usersState.update((rows) =>
      rows.map((u) => (u.id === id ? { ...u, ...patch, email: patch.email?.trim().toLowerCase() ?? u.email } : u)),
    );
  }

  createBarberProfile(input: Omit<BarberProfile, 'id'> & { id?: string }): BarberProfile {
    const id = input.id ?? `bp-${crypto.randomUUID().slice(0, 8)}`;
    const row: BarberProfile = {
      id,
      userId: input.userId,
      branchId: input.branchId,
      displayName: input.displayName,
      commissionPercent: input.commissionPercent,
      isActive: input.isActive,
    };
    this.barbersState.update((a) => [...a, row]);
    return row;
  }

  updateBarberProfile(id: string, patch: Partial<Omit<BarberProfile, 'id'>>): void {
    this.barbersState.update((rows) => rows.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  setBarberActive(id: string, isActive: boolean): void {
    this.updateBarberProfile(id, { isActive });
  }

  /** Creates demo user + barber profile in one step (mock “create account”). */
  createBarberAccount(input: {
    email: string;
    fullName: string;
    branchId: string;
    displayName: string;
    commissionPercent: number;
  }): { user: User; barber: BarberProfile } {
    const user = this.createUser({
      email: input.email,
      fullName: input.fullName,
      isOwner: false,
      isActive: true,
    });
    const barber = this.createBarberProfile({
      userId: user.id,
      branchId: input.branchId,
      displayName: input.displayName,
      commissionPercent: input.commissionPercent,
      isActive: true,
    });
    return { user, barber };
  }

  // --- CRUD: services ---

  createService(input: Omit<Service, 'id'> & { id?: string }): Service {
    const id = input.id ?? `sv-${crypto.randomUUID().slice(0, 8)}`;
    const row: Service = {
      id,
      branchId: input.branchId,
      name: input.name,
      description: input.description ?? null,
      basePrice: input.basePrice,
      durationMin: input.durationMin ?? null,
      isActive: input.isActive,
    };
    this.servicesState.update((a) => [...a, row]);
    return row;
  }

  updateService(id: string, patch: Partial<Omit<Service, 'id'>>): void {
    this.servicesState.update((rows) => rows.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  setServiceActive(id: string, isActive: boolean): void {
    this.updateService(id, { isActive });
  }

  // --- CRUD: customers ---

  createCustomer(input: Omit<Customer, 'id'> & { id?: string }): Customer {
    const id = input.id ?? `cu-${crypto.randomUUID().slice(0, 8)}`;
    const row: Customer = {
      id,
      branchId: input.branchId,
      fullName: input.fullName,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? null,
      notes: input.notes ?? null,
    };
    this.customersState.update((a) => [...a, row]);
    return row;
  }

  updateCustomer(id: string, patch: Partial<Omit<Customer, 'id'>>): void {
    this.customersState.update((rows) => rows.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  deleteCustomer(id: string): void {
    this.customersState.update((rows) => rows.filter((c) => c.id !== id));
  }

  // --- CRUD: branch staff ---

  assignStaff(input: { userId: string; branchId: string; role: BranchStaffRole }): BranchStaff {
    const exists = this.branchStaffState().some(
      (s) => s.userId === input.userId && s.branchId === input.branchId && s.role === input.role,
    );
    if (exists) {
      throw new Error('This role is already assigned for this person at this branch');
    }
    const row: BranchStaff = {
      id: `bs-${crypto.randomUUID().slice(0, 8)}`,
      userId: input.userId,
      branchId: input.branchId,
      role: input.role,
    };
    this.branchStaffState.update((a) => [...a, row]);
    return row;
  }

  removeStaffAssignment(staffId: string): void {
    this.branchStaffState.update((rows) => rows.filter((s) => s.id !== staffId));
  }

  // --- Chart helpers (mock aggregates) ---

  /** Last N calendar days from newest transaction in data (or today), bucketed revenue. */
  revenueOverDays(dayCount: number, branchIds?: Set<string>): ChartSeries {
    const txs = this.transactionsState().filter((t) => !branchIds || branchIds.has(t.branchId));
    if (!txs.length) {
      const d = new Date();
      const labels: string[] = [];
      const values: number[] = [];
      for (let i = dayCount - 1; i >= 0; i--) {
        const x = new Date(d);
        x.setDate(x.getDate() - i);
        labels.push(this.formatDayLabel(x));
        values.push(0);
      }
      return { labels, values };
    }
    const newest = txs.reduce((max, t) => Math.max(max, new Date(t.paymentDate).getTime()), 0);
    const end = new Date(newest);
    end.setHours(0, 0, 0, 0);
    const buckets = new Map<string, number>();
    for (let i = dayCount - 1; i >= 0; i--) {
      const x = new Date(end);
      x.setDate(x.getDate() - i);
      const key = x.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const t of txs) {
      const key = new Date(t.paymentDate).toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + t.totalAmount);
      }
    }
    const labels = [...buckets.keys()].map((k) => this.formatDayLabel(new Date(k + 'T12:00:00')));
    const values = [...buckets.values()];
    return { labels, values };
  }

  branchPerformanceChart(branchIds?: Set<string>): ChartSeries {
    const dash = this.getOwnerDashboard();
    let rows = dash.byBranch;
    if (branchIds) {
      rows = rows.filter((r) => branchIds.has(r.branch.id));
    }
    return {
      labels: rows.map((r) => r.branch.name),
      values: rows.map((r) => r.revenue),
    };
  }

  barberEarningsChart(top = 8, branchIds?: Set<string>): ChartSeries {
    let rows = this.getOwnerDashboard().byBarber;
    if (branchIds) {
      rows = rows.filter((r) => branchIds.has(r.branch.id));
    }
    const sorted = [...rows].sort((a, b) => b.barberEarnings - a.barberEarnings).slice(0, top);
    return {
      labels: sorted.map((r) => r.barber.displayName),
      values: sorted.map((r) => r.barberEarnings),
    };
  }

  serviceMixChart(branchIds?: Set<string>): ChartSeries {
    const map = new Map<string, number>();
    for (const t of this.transactionsState()) {
      if (branchIds && !branchIds.has(t.branchId)) {
        continue;
      }
      const name = t.serviceNameSnapshot || 'Other';
      map.set(name, (map.get(name) ?? 0) + t.totalAmount);
    }
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    return {
      labels: entries.map(([k]) => k),
      values: entries.map(([, v]) => v),
    };
  }

  barberPersonalRevenueOverDays(barberProfileId: string, dayCount: number): ChartSeries {
    const txs = this.transactionsState().filter((t) => t.barberProfileId === barberProfileId);
    if (!txs.length) {
      return this.revenueOverDays(dayCount, undefined);
    }
    const newest = txs.reduce((max, t) => Math.max(max, new Date(t.paymentDate).getTime()), 0);
    const end = new Date(newest);
    end.setHours(0, 0, 0, 0);
    const buckets = new Map<string, number>();
    for (let i = dayCount - 1; i >= 0; i--) {
      const x = new Date(end);
      x.setDate(x.getDate() - i);
      const key = x.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }
    for (const t of txs) {
      const key = new Date(t.paymentDate).toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + t.barberEarning);
      }
    }
    const labels = [...buckets.keys()].map((k) => this.formatDayLabel(new Date(k + 'T12:00:00')));
    const values = [...buckets.values()];
    return { labels, values };
  }

  private formatDayLabel(d: Date): string {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  /** For UI: recent visits = transactions per customer (mock). */
  customerVisitCount(customerId: string): number {
    return this.transactionsState().filter((t) => t.customerId === customerId).length;
  }

  lastVisitForCustomer(customerId: string): string | null {
    const txs = this.transactionsState().filter((t) => t.customerId === customerId);
    if (!txs.length) {
      return null;
    }
    return txs.reduce((latest, t) =>
      new Date(t.paymentDate) > new Date(latest) ? t.paymentDate : latest,
    txs[0].paymentDate);
  }

  readonly barberEarningsByProfile = computed(() => {
    const m = new Map<string, number>();
    for (const t of this.transactionsState()) {
      m.set(t.barberProfileId, (m.get(t.barberProfileId) ?? 0) + t.barberEarning);
    }
    return m;
  });

  readonly transactionCountByBarber = computed(() => {
    const m = new Map<string, number>();
    for (const t of this.transactionsState()) {
      m.set(t.barberProfileId, (m.get(t.barberProfileId) ?? 0) + 1);
    }
    return m;
  });
}
