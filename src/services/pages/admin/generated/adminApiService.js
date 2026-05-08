import axiosClient from "../../../shared/http/axiosClient";
import { adminEndpointRegistry } from "./adminEndpointRegistry";

const DEFAULT_DELAY_MS = 120;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fillPathParams = (path, pathParams = {}) => {
  // [FIX] Strip redundant /api/v1 prefix if it exists, because axiosClient.baseURL already includes it
  const cleanPath = path.startsWith("/api/v1") ? path.replace("/api/v1", "") : path;
  
  return cleanPath.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    const value = pathParams[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path param: ${key}`);
    }
    return encodeURIComponent(String(value));
  });
};

const buildRequestConfig = ({ params, body, pathParams, config, endpoint }) => {
  const url = fillPathParams(endpoint.path, pathParams);
  return {
    url,
    method: endpoint.method.toLowerCase(),
    params,
    data: body,
    ...(config || {}),
  };
};

const createMockResponse = (endpoint, input) => ({
  success: true,
  isMock: true,
  endpoint: {
    key: endpoint.key,
    method: endpoint.method,
    path: endpoint.path,
    module: endpoint.module,
  },
  request: {
    pathParams: input.pathParams || {},
    params: input.params || {},
    body: input.body ?? null,
  },
  message: "Temporary admin mock response. Set mock=false to call backend.",
});

const createEndpointCaller = (endpoint) => {
  return async (input = {}) => {
    const shouldMock = input.mock !== false;
    if (shouldMock) {
      await wait(input.delayMs ?? DEFAULT_DELAY_MS);
      return createMockResponse(endpoint, input);
    }

    const requestConfig = buildRequestConfig({
      params: input.params,
      body: input.body,
      pathParams: input.pathParams,
      config: input.config,
      endpoint,
    });

    return axiosClient(requestConfig);
  };
};

const callByKey = async (key, input = {}) => {
  const endpoint = adminEndpointRegistry.find((item) => item.key === key);
  if (!endpoint) {
    throw new Error(`Unknown admin endpoint key: ${key}`);
  }
  return createEndpointCaller(endpoint)(input);
};

const listByModule = (moduleName) =>
  adminEndpointRegistry.filter((item) => item.module === moduleName);

const grouped = adminEndpointRegistry.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) {
    acc[endpoint.module] = [];
  }
  acc[endpoint.module].push(endpoint);
  return acc;
}, {});

const endpointCallers = Object.fromEntries(
  adminEndpointRegistry.flatMap((endpoint) => {
    const caller = createEndpointCaller(endpoint);
    const result = [[endpoint.key, caller]];
    
    // Add camelCase alias for better DX
    const camelKey = endpoint.key.replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
    if (camelKey !== endpoint.key) {
      result.push([camelKey, caller]);
    }
    
    return result;
  }),
);

const moduleServices = adminEndpointRegistry.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) {
    acc[endpoint.module] = {};
  }
  acc[endpoint.module][endpoint.key] = createEndpointCaller(endpoint);
  return acc;
}, {});

export const adminApiService = {
  callByKey,
  listByModule,
  endpoints: adminEndpointRegistry,
  modules: grouped,
  moduleServices,
  ...endpointCallers,
};

