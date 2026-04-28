import { adminApiService } from "../generated";

const toKeysParam = (keys) => {
  if (Array.isArray(keys)) {
    return keys.filter(Boolean).join(",");
  }
  return keys;
};

export const systemConfigService = {
  endpoints: adminApiService.endpoints,
  modules: adminApiService.modules,
  moduleServices: adminApiService.moduleServices,
  callByKey: adminApiService.callByKey,
  listByModule: adminApiService.listByModule,
  listConfigs: (input) => adminApiService.callByKey("get_system_configs", input),
  getPublicConfigs: (input) => adminApiService.callByKey("get_system_configs_public", input),
  getConfigValues: (keys, input = {}) => adminApiService.callByKey("get_system_configs_values", {
    ...input,
    params: {
      ...(input.params || {}),
      keys: toKeysParam(keys),
    },
  }),
  getConfig: (key, input = {}) => adminApiService.callByKey("get_system_configs_by_key", {
    ...input,
    pathParams: { key, ...(input.pathParams || {}) },
  }),
  updateConfig: (key, value, input = {}) => adminApiService.callByKey("put_system_configs_by_key", {
    ...input,
    pathParams: { key, ...(input.pathParams || {}) },
    body: { value, ...(input.body || {}) },
  }),
  listBackups: (input) => adminApiService.callByKey("get_system_backups", input),
  createBackup: (payload = {}, input = {}) => adminApiService.callByKey("post_system_backups", {
    ...input,
    body: payload,
  }),
  restoreBackup: (id, input = {}) => adminApiService.callByKey("post_system_backups_by_id_restore", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
    body: { confirm: true, ...(input.body || {}) },
  }),
  deleteBackup: (id, input = {}) => adminApiService.callByKey("delete_system_backups_by_id", {
    ...input,
    pathParams: { id, ...(input.pathParams || {}) },
  }),
};

export default systemConfigService;


