# Admin Generated Services

This folder is generated from backend route audit data in `BackEnd/api_from_container/src/api_role_audit_tmp.json`.

## Files
- `adminEndpointRegistry.js`: endpoint metadata for all admin-allowed APIs.
- `adminApiService.js`: temporary service layer.
- `index.js`: barrel export.

## Usage
```js
import { adminApiService } from "@/services/pages/admin/generated";

// Mock mode (default, no backend call)
const mockResult = await adminApiService.get_auth_users();

// Real API call mode
const realResult = await adminApiService.get_auth_users({ mock: false, params: { page: 1, limit: 20 } });

// Dynamic call by key
const data = await adminApiService.callByKey("put_auth_users_by_id", {
  mock: false,
  pathParams: { id: 1 },
  body: { fullName: "Updated User" },
});

// Module-scoped callers (useful for APIs chưa được nối vào page)
const authApis = adminApiService.moduleServices.auth;
const list = await authApis.get_auth_users(); // mock by default

const disciplineApis = adminApiService.moduleServices.discipline;
const rankings = await disciplineApis.get_discipline_class_rankings({
  mock: false,
  params: { week: 1 },
});
```

## Endpoint count
- Admin endpoints generated: **353**
