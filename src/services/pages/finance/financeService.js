import { createScopedApiService } from "../admin/generated/createScopedApiService";

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
};

export default financeService;

