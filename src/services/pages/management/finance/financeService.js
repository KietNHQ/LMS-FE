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
};

export default financeService;




