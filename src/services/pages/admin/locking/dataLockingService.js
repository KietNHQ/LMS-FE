import { adminApiService } from "../generated";

export const dataLockingService = {
  endpoints: adminApiService.endpoints,
  modules: adminApiService.modules,
  moduleServices: adminApiService.moduleServices,
  callByKey: adminApiService.callByKey,
  listByModule: adminApiService.listByModule,
  submitGrade: (body = {}, input = {}) => adminApiService.callByKey("post_grades_submit", {
	...input,
	body,
  }),
  retractGrade: (body = {}, input = {}) => adminApiService.callByKey("post_grades_retract", {
	...input,
	body,
  }),
  finalizeGrade: (body = {}, input = {}) => adminApiService.callByKey("post_grades_finalize", {
	...input,
	body,
  }),
  finalizeClassGrades: (body = {}, input = {}) => adminApiService.callByKey("post_grades_finalize_class", {
	...input,
	body,
  }),
  finalizeSemesterGrades: (body = {}, input = {}) => adminApiService.callByKey("post_grades_finalize_semester", {
	...input,
	body,
  }),
  createUnlockRequest: (body = {}, input = {}) => adminApiService.callByKey("post_unlock_requests", {
	...input,
	body,
  }),
  listUnlockRequests: (input) => adminApiService.callByKey("get_unlock_requests", input),
  getUnlockRequestById: (id, input = {}) => adminApiService.callByKey("get_unlock_requests_by_id", {
	...input,
	pathParams: { id, ...(input.pathParams || {}) },
  }),
  approveUnlockRequest: (id, body = {}, input = {}) => adminApiService.callByKey("post_unlock_requests_by_id_approve", {
	...input,
	pathParams: { id, ...(input.pathParams || {}) },
	body,
  }),
  rejectUnlockRequest: (id, body = {}, input = {}) => adminApiService.callByKey("post_unlock_requests_by_id_reject", {
	...input,
	pathParams: { id, ...(input.pathParams || {}) },
	body,
  }),
  submitConduct: (id, body = {}, input = {}) => adminApiService.callByKey("post_conduct_by_id_submit", {
	...input,
	pathParams: { id, ...(input.pathParams || {}) },
	body,
  }),
  retractConduct: (id, body = {}, input = {}) => adminApiService.callByKey("post_conduct_by_id_retract", {
	...input,
	pathParams: { id, ...(input.pathParams || {}) },
	body,
  }),
  finalizeConduct: (id, body = {}, input = {}) => adminApiService.callByKey("post_conduct_by_id_finalize", {
	...input,
	pathParams: { id, ...(input.pathParams || {}) },
	body,
  }),
  finalizeSemesterConduct: (body = {}, input = {}) => adminApiService.callByKey("post_conduct_finalize_semester", {
	...input,
	body,
  }),
};

export default dataLockingService;



