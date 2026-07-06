import axiosClient from "../../shared/http/axiosClient";
import { resolveSchoolYearId, resolveSemesterId } from "../../shared/schoolYearLookup";
import { normalizeTimetableLesson } from "../../../utils/timetableShared";

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
  profile: null,
  summary: {
    averageScore: 0,
    attendanceRate: 0,
    upcomingTests: 0,
    unreadNotifications: 0,
  },
  upcomingTests: [],
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
  {
    id: 1,
    day_of_week: 1,
    start_time: "2026-05-07T07:00:00.000Z",
    room: "P201",
    class_teacher_subject: {
      subject_assignments: { display_name: "Toán" },
      teachers: { given_name: "Huỳnh", surname: "Trần" }
    }
  },
  {
    id: 2,
    day_of_week: 2,
    start_time: "07:50:00", // Test string format
    room: "P302",
    class_teacher_subject: {
      subject_assignments: { display_name: "Tiếng Anh" },
      teachers: { given_name: "Mai", surname: "Nguyễn" }
    }
  },
  {
    id: 3,
    day_of_week: 3,
    start_time: "2026-05-07T08:45:00.000Z",
    room: "P105",
    class_teacher_subject: {
      subject_assignments: { display_name: "Ngữ Văn" },
      teachers: { given_name: "Long", surname: "Phạm" }
    }
  }
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

const STUDENT_QUIZ_DETAIL_MOCK = {
  ...STUDENT_QUIZZES_MOCK[0],
  description: "Ôn tập hàm số bậc nhất và kỹ năng đọc đồ thị.",
  durationMinutes: 45,
  maxAttempts: 3,
  passScore: 5,
  isPublished: true,
  questions: [
    {
      id: 1,
      questionText: "Hàm số nào sau đây là hàm số bậc nhất?",
      questionType: "multiple_choice",
      points: 1,
      answers: [
        { id: 1, answerText: "y = 2x + 1", isCorrect: true },
        { id: 2, answerText: "y = x^2 + 1", isCorrect: false },
      ],
    },
  ],
};

const STUDENT_QUIZ_STATUS_MOCK = {
  hasActiveAttempt: false,
  canStart: true,
  canResume: false,
  message: "Chưa có bài làm, có thể bắt đầu",
};

const STUDENT_QUIZ_ATTEMPT_MOCK = {
  id: "attempt-1",
  quizId: 1,
  quizTitle: STUDENT_QUIZ_DETAIL_MOCK.title,
  status: "in_progress",
  startTime: "2026-04-22T07:00:00.000Z",
  endTime: "2026-04-22T07:45:00.000Z",
  timeRemaining: 2700,
  reconnectCount: 0,
  maxReconnect: 3,
};

const STUDENT_ENDPOINTS = [
  { key: "get_student_dashboard", method: "GET", path: "/dashboard/student", module: "dashboard", mock: false },
  { key: "get_school_years", method: "GET", path: "/school-years", module: "system", mock: false },
  { key: "get_students_by_id", method: "GET", path: "/students/:id", module: "profile", mock: false },
  { key: "get_students_by_id_grades", method: "GET", path: "/students/:id/grades", module: "grades", mock: false },
  { key: "get_students_by_id_grade_summary", method: "GET", path: "/students/:id/grade-summary", module: "grades", mock: false },
  { key: "get_students_by_id_attendance", method: "GET", path: "/students/:id/attendance", module: "grades", mock: false },
  { key: "get_students_by_id_schedule", method: "GET", path: "/students/:id/schedule", module: "schedule", mock: false },
  { key: "get_classes", method: "GET", path: "/students/:id/classes", module: "classes", mock: false },
  { key: "get_classes_by_id", method: "GET", path: "/students/:id/classes/:classId", module: "classes", mock: false },
  { key: "get_classes_by_id_schedule", method: "GET", path: "/classes/:id/schedule", module: "schedule", mock: false },
  { key: "get_student_schedule", method: "GET", path: "/timetable/student", module: "schedule", mock: false },
  { key: "get_student_notifications", method: "GET", path: "/notifications/my", module: "notifications", mock: false },
  { key: "patch_student_notifications_mark_all_read", method: "PUT", path: "/notifications/my/read-all", module: "notifications", mock: false },
  { key: "patch_student_notifications_by_id_read", method: "PUT", path: "/notifications/my/:id/read", module: "notifications", mock: false },
  { key: "get_student_support_faqs", method: "GET", path: "/communications/faqs", module: "support", mock: false },
  { key: "post_student_support_tickets", method: "POST", path: "/communications/tickets", module: "support", mock: false },
  { key: "get_quizzes", method: "GET", path: "/students/:id/quizzes", module: "quiz", mock: false },
  { key: "get_quizzes_by_id", method: "GET", path: "/quizzes/:id", module: "quiz", mock: false },
  { key: "post_quizzes_by_id_start", method: "POST", path: "/quizzes/:id/start", module: "quiz", mock: false },
  { key: "get_quizzes_by_id_status", method: "GET", path: "/quizzes/:id/status", module: "quiz", mock: false },
  { key: "get_quizzes_attempts_by_attemptid", method: "GET", path: "/quizzes/attempts/:attemptId", module: "quiz", mock: false },
  { key: "put_quizzes_attempts_by_attemptid", method: "PUT", path: "/quizzes/attempts/:attemptId", module: "quiz", mock: false },
  { key: "put_quizzes_attempts_by_attemptid_submit", method: "PUT", path: "/quizzes/attempts/:attemptId/submit", module: "quiz", mock: false },
  { key: "put_quizzes_attempts_by_id_sync", method: "PUT", path: "/quizzes/attempts/:id/sync", module: "quiz", mock: false },
  { key: "put_quizzes_attempts_by_id_heartbeat", method: "PUT", path: "/quizzes/attempts/:id/heartbeat", module: "quiz", mock: false },
  { key: "post_quizzes_attempts_by_id_validate", method: "POST", path: "/quizzes/attempts/:id/validate", module: "quiz", mock: false },
  { key: "get_lesson_by_id", method: "GET", path: "/lessons/:id", module: "lessons", mock: false },
  // Class Committee endpoints
  { key: "get_class_committee_context", method: "GET", path: "/students/me/class-committee-context", module: "class_committee", mock: false },
  { key: "get_class_committee_violations", method: "GET", path: "/class-committee/:classId/violations", module: "class_committee", mock: false },
  { key: "get_class_committee_lesson_evaluations", method: "GET", path: "/class-committee/:classId/lesson-evaluations", module: "class_committee", mock: false },
  // Conduct / Discipline
  { key: "get_student_conduct_summary", method: "GET", path: "/students/:id/conduct-summary", module: "conduct", mock: false },
  { key: "get_student_discipline_scores", method: "GET", path: "/students/:id/discipline-scores", module: "conduct", mock: false },
];

const createEndpointCaller = (endpoint) => async (input = {}) => {
  const shouldMock = input.mock === true;

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

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const getCurrentUserProfile = async () => {
  try {
    const response = await axiosClient.get("/auth/me");
    return response?.data?.profile || response?.profile || null;
  } catch {
    return null;
  }
};

const getStoredUserProfile = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    return stored?.profile || null;
  } catch {
    return null;
  }
};

const getScheduleScope = async ({ schoolYear, term } = {}) => {
  const [schoolYearId, semesterId] = await Promise.all([
    resolveSchoolYearId(schoolYear),
    resolveSemesterId(schoolYear, term),
  ]);

  return { schoolYearId, semesterId };
};

const mapScheduleRows = (rows) => getRows(rows).map((item, idx) => normalizeTimetableLesson(item, idx));

export const studentService = {
  endpoints: STUDENT_ENDPOINTS,
  modules,
  moduleServices,
  callByKey,
  listByModule,
  getDashboard: (input) => endpointCallers.get_student_dashboard(input),
  getStudentById: (input) => endpointCallers.get_students_by_id(input),
  getStudentGrades: (input) => endpointCallers.get_students_by_id_grades(input),
  getStudentGradeSummary: (input) => endpointCallers.get_students_by_id_grade_summary(input),
  getSchoolYears: (input) => endpointCallers.get_school_years(input),
  getStudentAttendance: (input) => endpointCallers.get_students_by_id_attendance(input),
  listClasses: (input) => endpointCallers.get_classes(input),
  getClasses: (input) => endpointCallers.get_classes(input),
  getClassById: (input) => endpointCallers.get_classes_by_id(input),
  getClassSchedule: (input) => endpointCallers.get_classes_by_id_schedule(input),
  getStudentSchedule: (input) => endpointCallers.get_student_schedule(input),
  getStudentScheduleMapped: async (input) => {
    const response = await endpointCallers.get_student_schedule(input);
    const studentRows = getRows(response);
    if (response?.success && studentRows.length > 0) {
      return mapScheduleRows(studentRows);
    }

    const { schoolYearId, semesterId } = await getScheduleScope(input?.params || {});
    const profile = getStoredUserProfile() || await getCurrentUserProfile();
    const profileStudentId = profile?.id || profile?.studentId || profile?.student_id;

    if (!profileStudentId || !schoolYearId || !semesterId) {
      return [];
    }

    const fallbackResponse = await endpointCallers.get_students_by_id_schedule({
      mock: false,
      pathParams: { id: profileStudentId },
      params: { semester_id: semesterId, school_year_id: schoolYearId },
    });

    return mapScheduleRows(fallbackResponse);
  },
  listNotifications: (input) => endpointCallers.get_student_notifications(input),
  markAllNotificationsRead: (input) => endpointCallers.patch_student_notifications_mark_all_read(input),
  markNotificationRead: (input) => endpointCallers.patch_student_notifications_by_id_read(input),
  listFaqs: (input) => endpointCallers.get_student_support_faqs(input),
  submitSupportTicket: (input) => endpointCallers.post_student_support_tickets(input),
  listQuizzes: (input) => endpointCallers.get_quizzes(input),
  getQuizById: (input) => endpointCallers.get_quizzes_by_id(input),
  startQuiz: (input) => endpointCallers.post_quizzes_by_id_start(input),
  getQuizStatus: (input) => endpointCallers.get_quizzes_by_id_status(input),
  getQuizAttemptById: (input) => endpointCallers.get_quizzes_attempts_by_attemptid(input),
  saveQuizAttempt: (input) => endpointCallers.put_quizzes_attempts_by_attemptid(input),
  submitQuiz: (input) => endpointCallers.put_quizzes_attempts_by_attemptid_submit(input),
  syncQuizAttempt: (input) => endpointCallers.put_quizzes_attempts_by_id_sync(input),
  heartbeatQuizAttempt: (input) => endpointCallers.put_quizzes_attempts_by_id_heartbeat(input),
  validateQuizAttempt: (input) => endpointCallers.post_quizzes_attempts_by_id_validate(input),
  getLessonById: (input) => endpointCallers.get_lesson_by_id(input),
  // Conduct / Discipline
  getClassCommitteeContext: (input) => endpointCallers.get_class_committee_context(input),
  getClassViolations: (input) => endpointCallers.get_class_committee_violations(input),
  getClassLessonEvaluations: (input) => endpointCallers.get_class_committee_lesson_evaluations(input),
  getConductSummary: (input) => endpointCallers.get_student_conduct_summary(input),
  getDisciplineScores: (input) => endpointCallers.get_student_discipline_scores(input),
};

export default studentService;
