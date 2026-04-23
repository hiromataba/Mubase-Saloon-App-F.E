/** Local-calendar aggregates for dashboard / transactions quick stats. */

export interface TxPeriodStats {
  todayCount: number;
  todayRevenue: number;
  weekCount: number;
  weekRevenue: number;
  monthCount: number;
  monthRevenue: number;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Monday-based week start in local time. */
function startOfLocalWeek(d: Date): Date {
  const s = startOfLocalDay(d);
  const day = s.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  s.setDate(s.getDate() + offset);
  return s;
}

function startOfLocalMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function summarizeTransactionsByPeriod(
  rows: readonly { paymentDate: string; totalAmount: number }[],
): TxPeriodStats {
  const now = new Date();
  const t0 = startOfLocalDay(now).getTime();
  const w0 = startOfLocalWeek(now).getTime();
  const m0 = startOfLocalMonth(now).getTime();

  let todayCount = 0;
  let todayRevenue = 0;
  let weekCount = 0;
  let weekRevenue = 0;
  let monthCount = 0;
  let monthRevenue = 0;

  for (const row of rows) {
    const t = new Date(row.paymentDate).getTime();
    if (Number.isNaN(t)) {
      continue;
    }
    const amt = row.totalAmount;
    if (t >= t0) {
      todayCount += 1;
      todayRevenue += amt;
    }
    if (t >= w0) {
      weekCount += 1;
      weekRevenue += amt;
    }
    if (t >= m0) {
      monthCount += 1;
      monthRevenue += amt;
    }
  }

  return {
    todayCount,
    todayRevenue,
    weekCount,
    weekRevenue,
    monthCount,
    monthRevenue,
  };
}
