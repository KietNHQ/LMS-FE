import { adminApiService } from "./adminApiService";

const unique = (items = []) => Array.from(new Set(items.filter(Boolean)));

const pickModules = (moduleNames = []) => {
  const names = unique(moduleNames);
  return names.reduce((acc, moduleName) => {
    if (adminApiService.modules[moduleName]) {
      acc[moduleName] = adminApiService.modules[moduleName];
    }
    return acc;
  }, {});
};

const pickModuleServices = (moduleNames = []) => {
  const names = unique(moduleNames);
  return names.reduce((acc, moduleName) => {
    if (adminApiService.moduleServices[moduleName]) {
      acc[moduleName] = adminApiService.moduleServices[moduleName];
    }
    return acc;
  }, {});
};

const flattenEndpointCallers = (moduleServices = {}) => {
  return Object.values(moduleServices).reduce((acc, serviceMap) => {
    Object.assign(acc, serviceMap);
    return acc;
  }, {});
};

export const createScopedApiService = (moduleNames = []) => {
  const modules = pickModules(moduleNames);
  const moduleServices = pickModuleServices(moduleNames);
  const endpointCallers = flattenEndpointCallers(moduleServices);
  const endpoints = Object.values(modules).flat();

  const endpointByKey = Object.fromEntries(endpoints.map((endpoint) => [endpoint.key, endpoint]));

  const callByKey = (key, input = {}) => {
    const caller = endpointCallers[key];
    if (!caller) {
      throw new Error(`Endpoint key is not available in scoped service: ${key}`);
    }
    return caller(input);
  };

  const listByModule = (moduleName) => modules[moduleName] || [];

  const findEndpoint = (method, path) => {
    const normalizedMethod = `${method || ""}`.toUpperCase();
    const endpoint = endpoints.find((item) => item.method === normalizedMethod && item.path === path);
    if (!endpoint) {
      throw new Error(`Endpoint is not available in scoped service: ${method} ${path}`);
    }
    return endpoint;
  };

  const call = (method, path, input = {}) => {
    const endpoint = findEndpoint(method, path);
    return callByKey(endpoint.key, input);
  };

  const listModules = () => Object.keys(modules);

  const hasModule = (moduleName) => Boolean(modules[moduleName]);

  const hasEndpoint = (key) => Boolean(endpointByKey[key]);

  return {
    endpoints,
    modules,
    moduleServices,
    endpointCallers,
    callByKey,
    listByModule,
    call,
    listModules,
    hasModule,
    hasEndpoint,
  };
};

export default createScopedApiService;


