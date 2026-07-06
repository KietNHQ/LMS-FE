const ROUND_STEP = 1000;

export const PAYMENT_STORAGE_KEYS = {
  ADMIN_DUE_DATES: "admin_payment_due_dates_v1",
  ADMIN_DUE_DATE_HISTORY: "admin_payment_due_date_history_v1",
};

export const FEE_ORDER = [
  "tuition",
  "boarding",
  "service",
  "deduction",
  "extra",
  "paid",
  "remaining",
];

export const FEE_LABELS = {
  tuition: "Hoc phi",
  boarding: "Ban tru",
  service: "Dich vu",
  deduction: "Giam tru",
  extra: "Phat sinh",
  paid: "Da thanh toan",
  remaining: "Con lai",
};

export function roundMoney(amount) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value / ROUND_STEP) * ROUND_STEP;
}

export function formatVnd(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")} ₫`;
}

export function normalizeDate(input) {
  if (!input) return "";
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function formatDateVi(dateLike) {
  const iso = normalizeDate(dateLike);
  if (!iso) return "--";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function mapFeeCategory(name = "", note = "") {
  const text = `${name} ${note}`.toLowerCase();
  if (text.includes("ban tru")) return "boarding";
  if (text.includes("dich vu") || text.includes("ky nang") || text.includes("bao hiem")) return "service";
  if (text.includes("giam") || text.includes("mien")) return "deduction";
  if (text.includes("phat sinh") || text.includes("dong phuc") || text.includes("le phi")) return "extra";
  return "tuition";
}

export function buildBreakdownFromItems(items = [], paidAmount = 0) {
  const summary = {
    tuition: 0,
    boarding: 0,
    service: 0,
    deduction: 0,
    extra: 0,
    paid: roundMoney(paidAmount),
    remaining: 0,
  };

  items.forEach((item) => {
    const amount = roundMoney(item.amount);
    const category = mapFeeCategory(item.name, item.note);
    if (category === "deduction") {
      summary.deduction += Math.abs(amount);
    } else {
      summary[category] += amount;
    }
  });

  const totalBeforePaid = summary.tuition + summary.boarding + summary.service + summary.extra - summary.deduction;
  summary.remaining = Math.max(roundMoney(totalBeforePaid - summary.paid), 0);

  return FEE_ORDER.map((key) => ({
    key,
    label: FEE_LABELS[key],
    amount: roundMoney(summary[key]),
  }));
}

export function getDueStatus(payment, now = new Date()) {
  if (!payment) return { key: "default", label: "Chua xac dinh", badgeStatus: "default" };
  if (payment.status === "paid") return { key: "paid", label: "Da thanh toan", badgeStatus: "success" };

  const deadline = normalizeDate(payment.deadline);
  if (!deadline) return { key: "upcoming", label: "Chua den han", badgeStatus: "info" };

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(deadline);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) return { key: "overdue", label: "Qua han", badgeStatus: "error" };
  if (diffDays <= 7) return { key: "due_soon", label: "Sap den han", badgeStatus: "warning" };
  return { key: "upcoming", label: "Chua den han", badgeStatus: "info" };
}

export function buildDueDateHistoryEntry({ oldDate, newDate, reason, updatedBy }) {
  return {
    id: Date.now(),
    oldDate: normalizeDate(oldDate),
    newDate: normalizeDate(newDate),
    reason: reason || "Cap nhat han nop",
    updatedBy: updatedBy || "Admin",
    updatedAt: new Date().toISOString(),
  };
}



