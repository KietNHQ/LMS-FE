import { createScopedApiService } from "../../admin/generated/createScopedApiService";

const FINANCE_MODULES = [
  "dashboard",
  "fees",
  "fee_notices",
  "debts",
  "school_bank_accounts",
  "students",
  "classes",
  "exports",
  "notifications",
  "audit_logs",
  "system_config",
];

const scopedApi = createScopedApiService(FINANCE_MODULES);

export const financeService = {
  role: "finance",
  ...scopedApi,
  listDebts: (input) => scopedApi.callByKey("get_finance_debts", input),
  getDebtSummary: (input) => scopedApi.callByKey("get_finance_debts_summary", input),
  getRevenueReport: (input) => scopedApi.callByKey("get_finance_debts_revenue_report", input),
  getStudentDebts: (studentId, input = {}) => scopedApi.callByKey("get_finance_debts_student_by_studentid", {
    ...input,
    pathParams: { studentId, ...(input.pathParams || {}) },
  }),
  getDebtById: (id, input = {}) => scopedApi.callByKey("get_finance_debts_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  createDebt: (body = {}, input = {}) => scopedApi.callByKey("post_finance_debts", {
    ...input,
    body,
  }),
  updateDebt: (id, body = {}, input = {}) => scopedApi.callByKey("patch_finance_debts_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
    body,
  }),
  deleteDebt: (id, input = {}) => scopedApi.callByKey("delete_finance_debts_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  recordDebtPayment: (id, body = {}, input = {}) => scopedApi.callByKey("post_finance_debts_by_id_payment", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
    body,
  }),
  sendDebtReminder: (id, body = {}, input = {}) => scopedApi.callByKey("post_finance_debts_by_id_remind", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
    body,
  }),
  // Invoice methods
  getAllInvoices: (input) => scopedApi.callByKey("get_fees_invoices_all", input),
  getInvoiceById: (id, input = {}) => scopedApi.callByKey("get_fees_invoices_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  payInvoice: (id, body = {}, input = {}) => scopedApi.callByKey("put_fees_invoices_by_id_pay", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
    body,
  }),
  getPaymentHistory: (input) => scopedApi.callByKey("get_fees_payments", input),
  // Notification methods
  getNotifications: (input) => scopedApi.callByKey("get_notifications", input),
  createNotification: (input) => scopedApi.callByKey("post_notifications", input),
  deleteNotification: (id, input = {}) => scopedApi.callByKey("delete_notifications_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  markNotificationRead: (id, input = {}) => scopedApi.callByKey("put_notifications_by_id_read", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  markAllNotificationsRead: () => scopedApi.callByKey("put_notifications_read_all"),
  // Audit Log methods
  getAuditLogs: (input) => scopedApi.callByKey("get_audit_logs", input),
  getAuditLogSummary: (input) => scopedApi.callByKey("get_audit_logs_summary", input),
  // Fee methods
  getFees: (input) => scopedApi.callByKey("get_fees", input),
  createFee: (input) => scopedApi.callByKey("post_fees", input),
  updateFee: (id, input = {}) => scopedApi.callByKey("put_fees_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  deleteFee: (id, input = {}) => scopedApi.callByKey("delete_fees_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
};

export default financeService;




