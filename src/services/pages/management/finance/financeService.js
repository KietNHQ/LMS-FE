import axiosClient from "../../../shared/http/axiosClient";
import { createScopedApiService } from "../../admin/generated/createScopedApiService";
import { resolveSemesterId, resolveGradeLevelId } from "../../../shared/schoolYearLookup";

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

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeText = (value) => `${value || ""}`.trim().toLowerCase();

const schoolYearCache = { ts: 0, rows: [] };
const SCHOOL_YEAR_CACHE_TTL = 5 * 60 * 1000;

const loadSchoolYears = async () => {
  try {
    const payload = await axiosClient.get("/school-years");
    return getRows(payload);
  } catch {
    return [];
  }
};

const resolveSchoolYearId = async (schoolYearName) => {
  if (!schoolYearName) return undefined;
  if (typeof schoolYearName === "number") return schoolYearName;
  const now = Date.now();
  if (schoolYearCache.rows.length === 0 || now - schoolYearCache.ts > SCHOOL_YEAR_CACHE_TTL) {
    schoolYearCache.rows = await loadSchoolYears();
    schoolYearCache.ts = now;
  }
  const target = normalizeText(schoolYearName);
  const matched = schoolYearCache.rows.find(
    (row) => normalizeText(row.name || "") === target,
  );
  return matched?.id;
};

const wrapSchoolYearParams = async (params) => {
  if (!params) return params;
  const result = { ...params };
  const syName = params.schoolYearId;
  if (syName !== undefined && syName !== null) {
    const resolvedId = await resolveSchoolYearId(syName);
    result.schoolYearId = resolvedId ?? 0;
  }
  const semId = params.semesterId;
  if (semId !== undefined && semId !== null) {
    if (typeof semId === "string") {
      const resolvedSemId = await resolveSemesterId(syName, semId);
      result.semesterId = resolvedSemId ?? 0;
    }
  }
  const gradeVal = params.grade;
  if (gradeVal !== undefined && gradeVal !== null) {
    const gradeLevelId = await resolveGradeLevelId(gradeVal);
    if (gradeLevelId) {
      result.gradeLevelId = gradeLevelId;
    }
    delete result.grade;
  }
  return result;
};

const wrapSchoolYearParamsDebts = async (input) => {
  const params = input?.params ? await wrapSchoolYearParams(input.params) : undefined;
  return scopedApi.callByKey("get_finance_debts_summary", { ...input, params });
};

const wrapSchoolYearParamsRevenue = async (input) => {
  const params = input?.params ? await wrapSchoolYearParams(input.params) : undefined;
  return scopedApi.callByKey("get_finance_debts_revenue_report", { ...input, params });
};

const wrapSchoolYearParamsListDebts = async (input) => {
  const params = input?.params ? await wrapSchoolYearParams(input.params) : undefined;
  return scopedApi.callByKey("get_finance_debts", { ...input, params });
};

export const financeService = {
  role: "finance",
  ...scopedApi,
  listDebts: wrapSchoolYearParamsListDebts,
  getDebtSummary: wrapSchoolYearParamsDebts,
  getRevenueReport: wrapSchoolYearParamsRevenue,
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
  signInvoice: (id, input = {}) => scopedApi.callByKey("post_fees_invoices_by_id_sign", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  sendInvoice: (id, input = {}) => scopedApi.callByKey("post_fees_invoices_by_id_send", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
    body: input.body || {},
  }),
  getPaymentHistory: (input) => scopedApi.callByKey("get_fees_payments", input),
  getPaymentStats: (input) => axiosClient.get("/fees/payments/stats", input),
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
  sendNotification: (id, input = {}) => scopedApi.callByKey("post_notifications_by_id_send", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
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
  // Batch debts
  createBatchDebts: (body = {}, input = {}) => scopedApi.callByKey("post_finance_debts_batch", {
    ...input,
    body,
  }),
  // Fee exemptions
  getFeeExemptions: (input) => scopedApi.callByKey("get_fee_exemptions", input),
  createFeeExemption: (input) => scopedApi.callByKey("post_fee_exemptions", input),
  approveFeeExemption: (id, input = {}) => scopedApi.callByKey("post_fee_exemptions_by_id_approve", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  rejectFeeExemption: (id, input = {}) => scopedApi.callByKey("post_fee_exemptions_by_id_reject", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  deleteFeeExemption: (id, input = {}) => scopedApi.callByKey("delete_fee_exemptions_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
  // Period closing
  getPeriodClosings: (input) => scopedApi.callByKey("get_period_closings", input),
  getPeriodClosingStatus: (input) => scopedApi.callByKey("get_period_closings_status", input),
  closePeriod: (body = {}, input = {}) => scopedApi.callByKey("post_period_closings_close", {
    ...input,
    body,
  }),
  reopenPeriod: (body = {}, input = {}) => scopedApi.callByKey("post_period_closings_reopen", {
    ...input,
    body,
  }),
  // Finance approval requests
  listApprovals: (input = {}) =>
    axiosClient.get("/finance/approvals", { params: input?.params }),
  getApprovalById: (id, input = {}) =>
    axiosClient.get(`/finance/approvals/${id}`, input),
  createApprovalRequest: (body = {}, input = {}) =>
    axiosClient.post("/finance/approvals", body, input),
  approveRequest: (id, body = {}, input = {}) =>
    axiosClient.post(`/finance/approvals/${id}/approve`, body, input),
  rejectRequest: (id, body = {}, input = {}) =>
    axiosClient.post(`/finance/approvals/${id}/reject`, body, input),
  deleteApprovalRequest: (id, input = {}) =>
    axiosClient.delete(`/finance/approvals/${id}`, input),
};

export default financeService;




