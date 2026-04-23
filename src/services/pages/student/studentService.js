import axiosClient from "../../shared/http/axiosClient";

const DEFAULT_DELAY_MS = 120;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fillPathParams = (path, pathParams = {}) =>
  path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    const value = pathParams[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path param: ${key}`);
    }
    return encodeURIComponent(String(value));
  });

const buildRequestConfig = ({ endpoint, params, body, pathParams, config }) => ({
  url: fillPathParams(endpoint.path, pathParams),
  method: endpoint.method.toLowerCase(),
  params,
  data: body,
  ...(config || {}),
});

const createMockResponse = (endpoint, input, data) => ({
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
  data,
  message: "Temporary student mock response. Set mock=false to call backend.",
});

const STUDENT_PROFILE_MOCK = {
  id: 9001,
  fullName: "Nguyễn Minh Tuấn",
  studentCode: "STU1024",
  className: "10A1",
  schoolYear: "2025-2026",
};

const STUDENT_DASHBOARD_MOCK = {
  profile: STUDENT_PROFILE_MOCK,
  summary: {
    averageScore: 8.6,
    attendanceRate: 95,
    upcomingTests: 3,
    unreadNotifications: 4,
  },
  upcomingTests: [
    { id: 1, subject: "Toán", date: "2026-04-24", title: "Kiểm tra 15 phút" },
    { id: 2, subject: "Vật lý", date: "2026-04-26", title: "Kiểm tra chương 2" },
  ],
};

const STUDENT_GRADES_MOCK = {
  hk1: [
    { subject: "Toán", oral: 8, test15: 8, midterm: 8, final: 9, average: 8.3 },
    { subject: "Tiếng Anh", oral: 7, test15: 8, midterm: 7, final: 8, average: 7.5 },
  ],
  hk2: [
    { subject: "Toán", oral: 9, test15: 8, midterm: 9, final: 9, average: 8.8 },
    { subject: "Tiếng Anh", oral: 8, test15: 8, midterm: 8, final: 9, average: 8.3 },
  ],
  year: [
    { subject: "Toán", average: 8.6 },
    { subject: "Tiếng Anh", average: 7.9 },
  ],
};

const STUDENT_CLASSES_MOCK = [
  { id: 1, subject: "Toán", teacher: "Lê Minh Hoàng", room: "A101", progress: 80 },
  { id: 2, subject: "Tiếng Anh", teacher: "Trần Thu Hà", room: "B203", progress: 75 },
  { id: 3, subject: "Vật lý", teacher: "Nguyễn Anh Dũng", room: "C104", progress: 72 },
];

const STUDENT_SCHEDULE_MOCK = [
  { id: 1, day: "Thứ 2", time: "07:30 - 09:00", subject: "Toán", room: "A101" },
  { id: 2, day: "Thứ 3", time: "09:45 - 11:15", subject: "Tiếng Anh", room: "B203" },
  { id: 3, day: "Thứ 4", time: "13:00 - 14:30", subject: "Vật lý", room: "C104" },
];

const STUDENT_NOTIFICATIONS_MOCK = [
  { id: 1, title: "Lịch thi HK2", content: "Thi bắt đầu từ ngày 20/05/2025", date: "2025-01-15", unread: true, class: "10" },
  { id: 2, title: "Nhắc nộp bài", content: "Bài tập Toán cần nộp trước 20:00", date: "2025-01-18", unread: true, class: "10" },
  { id: 3, title: "Thông báo hệ thống", content: "Bảo trì hệ thống LMS", date: "2025-01-20", unread: false, class: "all" },
];

const STUDENT_FAQS_MOCK = [
  { category: "Học tập", question: "Xem điểm ở đâu?", answer: "Vào mục Điểm số để xem chi tiết theo học kỳ.", popularity: 92 },
  { category: "Lịch học", question: "Làm sao xem thời khóa biểu tuần?", answer: "Vào mục Lịch học và chọn tuần cần xem.", popularity: 88 },
  { category: "Tài khoản", question: "Quên mật khẩu thì làm sao?", answer: "Sử dụng Quên mật khẩu ở màn đăng nhập hoặc liên hệ giáo vụ.", popularity: 85 },
];

const STUDENT_QUIZZES_MOCK = [
  { id: 1, title: "Quiz Toán - Hàm số", subject: "Toán", status: "available", dueAt: "2026-04-25T20:00:00.000Z" },
  { id: 2, title: "Quiz Anh - Unit 5", subject: "Tiếng Anh", status: "submitted", score: 8.5 },
];

const STUDENT_ENDPOINTS = [
  { key: "get_student_dashboard", method: "GET", path: "/api/v1/dashboard/student", module: "dashboard", mock: () => STUDENT_DASHBOARD_MOCK },
  { key: "get_students_by_id", method: "GET", path: "/api/v1/students/:id", module: "profile", mock: () => STUDENT_PROFILE_MOCK },
  { key: "get_students_by_id_grades", method: "GET", path: "/api/v1/students/:id/grades", module: "grades", mock: () => STUDENT_GRADES_MOCK },
  { key: "get_students_by_id_attendance", method: "GET", path: "/api/v1/students/:id/attendance", module: "grades", mock: () => ({ weekly: [], monthly: [] }) },
  { key: "get_classes", method: "GET", path: "/api/v1/classes", module: "classes", mock: () => STUDENT_CLASSES_MOCK },
  { key: "get_classes_by_id", method: "GET", path: "/api/v1/classes/:id", module: "classes", mock: (input) => STUDENT_CLASSES_MOCK.find((item) => `${item.id}` === `${input.pathParams?.id}`) || null },
  { key: "get_classes_by_id_schedule", method: "GET", path: "/api/v1/classes/:id/schedule", module: "schedule", mock: () => STUDENT_SCHEDULE_MOCK },
  { key: "get_student_schedule", method: "GET", path: "/api/v1/timetable/student", module: "schedule", mock: () => STUDENT_SCHEDULE_MOCK },
  { key: "get_student_notifications", method: "GET", path: "/api/v1/notifications/student", module: "notifications", mock: () => STUDENT_NOTIFICATIONS_MOCK },
  { key: "patch_student_notifications_mark_all_read", method: "PATCH", path: "/api/v1/notifications/student/mark-all-read", module: "notifications", mock: () => ({ updated: true }) },
  { key: "patch_student_notifications_by_id_read", method: "PATCH", path: "/api/v1/notifications/student/:id/read", module: "notifications", mock: (input) => ({ id: input.pathParams?.id, unread: false }) },
  { key: "get_student_support_faqs", method: "GET", path: "/api/v1/support/student/faqs", module: "support", mock: () => STUDENT_FAQS_MOCK },
  { key: "post_student_support_tickets", method: "POST", path: "/api/v1/support/student/tickets", module: "support", mock: (input) => ({ id: Date.now(), ...(input.body || {}), status: "open" }) },
  { key: "get_student_quizzes", method: "GET", path: "/api/v1/quizzes/student", module: "quiz", mock: () => STUDENT_QUIZZES_MOCK },
  { key: "get_student_quizzes_by_id", method: "GET", path: "/api/v1/quizzes/student/:id", module: "quiz", mock: (input) => STUDENT_QUIZZES_MOCK.find((item) => `${item.id}` === `${input.pathParams?.id}`) || null },
  { key: "post_student_quizzes_by_id_start", method: "POST", path: "/api/v1/quizzes/student/:id/start", module: "quiz", mock: (input) => ({ id: input.pathParams?.id, status: "in_progress" }) },
  { key: "post_student_quizzes_by_id_submit", method: "POST", path: "/api/v1/quizzes/student/:id/submit", module: "quiz", mock: (input) => ({ id: input.pathParams?.id, status: "submitted", score: 8.0 }) },
];

const createEndpointCaller = (endpoint) => async (input = {}) => {
  const shouldMock = input.mock !== false;

  if (shouldMock) {
    await wait(input.delayMs ?? DEFAULT_DELAY_MS);
    const data = typeof endpoint.mock === "function" ? endpoint.mock(input) : null;
    return createMockResponse(endpoint, input, data);
  }

  return axiosClient(
    buildRequestConfig({
      endpoint,
      params: input.params,
      body: input.body,
      pathParams: input.pathParams,
      config: input.config,
    }),
  );
};

const endpointCallers = Object.fromEntries(
  STUDENT_ENDPOINTS.map((endpoint) => [endpoint.key, createEndpointCaller(endpoint)]),
);

const modules = STUDENT_ENDPOINTS.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) acc[endpoint.module] = [];
  acc[endpoint.module].push(endpoint);
  return acc;
}, {});

const moduleServices = STUDENT_ENDPOINTS.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) acc[endpoint.module] = {};
  acc[endpoint.module][endpoint.key] = endpointCallers[endpoint.key];
  return acc;
}, {});

const callByKey = async (key, input = {}) => {
  const endpoint = STUDENT_ENDPOINTS.find((item) => item.key === key);
  if (!endpoint) {
    throw new Error(`Unknown student endpoint key: ${key}`);
  }
  return createEndpointCaller(endpoint)(input);
};

const listByModule = (moduleName) => STUDENT_ENDPOINTS.filter((item) => item.module === moduleName);

export const studentService = {
  endpoints: STUDENT_ENDPOINTS,
  modules,
  moduleServices,
  callByKey,
  listByModule,
  getDashboard: (input) => endpointCallers.get_student_dashboard(input),
  getStudentById: (input) => endpointCallers.get_students_by_id(input),
  getStudentGrades: (input) => endpointCallers.get_students_by_id_grades(input),
  getStudentAttendance: (input) => endpointCallers.get_students_by_id_attendance(input),
  listClasses: (input) => endpointCallers.get_classes(input),
  getClassById: (input) => endpointCallers.get_classes_by_id(input),
  getClassSchedule: (input) => endpointCallers.get_classes_by_id_schedule(input),
  getStudentSchedule: (input) => endpointCallers.get_student_schedule(input),
  listNotifications: (input) => endpointCallers.get_student_notifications(input),
  markAllNotificationsRead: (input) => endpointCallers.patch_student_notifications_mark_all_read(input),
  markNotificationRead: (input) => endpointCallers.patch_student_notifications_by_id_read(input),
  listFaqs: (input) => endpointCallers.get_student_support_faqs(input),
  submitSupportTicket: (input) => endpointCallers.post_student_support_tickets(input),
  listQuizzes: (input) => endpointCallers.get_student_quizzes(input),
  getQuizById: (input) => endpointCallers.get_student_quizzes_by_id(input),
  startQuiz: (input) => endpointCallers.post_student_quizzes_by_id_start(input),
  submitQuiz: (input) => endpointCallers.post_student_quizzes_by_id_submit(input),
};

export default studentService;

