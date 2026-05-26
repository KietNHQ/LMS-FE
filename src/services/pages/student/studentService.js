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
  { key: "get_student_dashboard", method: "GET", path: "/dashboard/student", module: "dashboard", mock: () => STUDENT_DASHBOARD_MOCK },
  { key: "get_school_years", method: "GET", path: "/school-years", module: "system", mock: () => ([{ id: 1, name: "2025-2026" }, { id: 2, name: "2024-2025" }]) },
  { key: "get_students_by_id", method: "GET", path: "/students/:id", module: "profile", mock: () => STUDENT_PROFILE_MOCK },
  { key: "get_students_by_id_grades", method: "GET", path: "/students/:id/grades", module: "grades", mock: () => STUDENT_GRADES_MOCK },
  { key: "get_students_by_id_grade_summary", method: "GET", path: "/students/:id/grade-summary", module: "grades", mock: () => STUDENT_GRADES_MOCK },
  { key: "get_students_by_id_attendance", method: "GET", path: "/students/:id/attendance", module: "grades", mock: () => ({ weekly: [], monthly: [] }) },
  { key: "get_classes", method: "GET", path: "/students/:id/classes", module: "classes", mock: () => STUDENT_CLASSES_MOCK },
  { key: "get_classes_by_id", method: "GET", path: "/students/:id/classes/:classId", module: "classes", mock: (input) => STUDENT_CLASSES_MOCK.find((item) => `${item.id}` === `${input.pathParams?.classId}`) || null },
  { key: "get_classes_by_id_schedule", method: "GET", path: "/classes/:id/schedule", module: "schedule", mock: () => STUDENT_SCHEDULE_MOCK },
  { key: "get_student_schedule", method: "GET", path: "/timetable", module: "schedule", mock: () => STUDENT_SCHEDULE_MOCK },
  { key: "get_student_notifications", method: "GET", path: "/notifications/my", module: "notifications", mock: () => STUDENT_NOTIFICATIONS_MOCK },
  { key: "patch_student_notifications_mark_all_read", method: "PUT", path: "/notifications/my/read-all", module: "notifications", mock: () => ({ updated: true }) },
  { key: "patch_student_notifications_by_id_read", method: "PUT", path: "/notifications/my/:id/read", module: "notifications", mock: (input) => ({ id: input.pathParams?.id, unread: false }) },
  { key: "get_student_support_faqs", method: "GET", path: "/communications/faqs", module: "support", mock: () => STUDENT_FAQS_MOCK },
  { key: "post_student_support_tickets", method: "POST", path: "/communications/tickets", module: "support", mock: (input) => ({ id: Date.now(), ...(input.body || {}), status: "open" }) },
  { key: "get_quizzes", method: "GET", path: "/students/:id/quizzes", module: "quiz", mock: () => STUDENT_QUIZZES_MOCK },
  { key: "get_quizzes_by_id", method: "GET", path: "/quizzes/:id", module: "quiz", mock: (input) => {
      const matched = STUDENT_QUIZZES_MOCK.find((item) => `${item.id}` === `${input.pathParams?.id}`);
      return matched ? { ...STUDENT_QUIZ_DETAIL_MOCK, ...matched } : null;
    } },
  { key: "post_quizzes_by_id_start", method: "POST", path: "/quizzes/:id/start", module: "quiz", mock: (input) => ({
      attemptId: "attempt-1",
      type: "new",
      isResume: false,
      quiz: { ...STUDENT_QUIZ_DETAIL_MOCK, id: input.pathParams?.id },
      attempt: { ...STUDENT_QUIZ_ATTEMPT_MOCK, quizId: input.pathParams?.id },
      questions: STUDENT_QUIZ_DETAIL_MOCK.questions,
      timeRemaining: STUDENT_QUIZ_ATTEMPT_MOCK.timeRemaining,
    }) },
  { key: "get_quizzes_by_id_status", method: "GET", path: "/quizzes/:id/status", module: "quiz", mock: () => STUDENT_QUIZ_STATUS_MOCK },
  { key: "get_quizzes_attempts_by_attemptid", method: "GET", path: "/quizzes/attempts/:attemptId", module: "quiz", mock: (input) => ({ ...STUDENT_QUIZ_ATTEMPT_MOCK, id: input.pathParams?.attemptId, status: "in_progress" }) },
  { key: "put_quizzes_attempts_by_attemptid", method: "PUT", path: "/quizzes/attempts/:attemptId", module: "quiz", mock: (input) => ({ ...STUDENT_QUIZ_ATTEMPT_MOCK, id: input.pathParams?.attemptId, ...(input.body || {}), updated: true }) },
  { key: "put_quizzes_attempts_by_attemptid_submit", method: "PUT", path: "/quizzes/attempts/:attemptId/submit", module: "quiz", mock: (input) => ({ id: input.pathParams?.attemptId, status: "submitted", score: 8.0, passed: true }) },
  { key: "put_quizzes_attempts_by_id_sync", method: "PUT", path: "/quizzes/attempts/:id/sync", module: "quiz", mock: (input) => ({ attemptId: input.pathParams?.id, questionId: input.body?.questionId, savedAt: new Date().toISOString(), message: "Đã lưu đáp án" }) },
  { key: "put_quizzes_attempts_by_id_heartbeat", method: "PUT", path: "/quizzes/attempts/:id/heartbeat", module: "quiz", mock: (input) => ({ attemptId: input.pathParams?.id, timeRemaining: 1800, heartbeatAt: new Date().toISOString(), message: "Heartbeat OK" }) },
  { key: "post_quizzes_attempts_by_id_validate", method: "POST", path: "/quizzes/attempts/:id/validate", module: "quiz", mock: (input) => ({ attemptId: input.pathParams?.id, canSubmit: true, timeRemaining: 600, status: "in_progress" }) },
  { key: "get_lesson_by_id", method: "GET", path: "/lessons/:id", module: "lessons", mock: (input) => ({ id: input.pathParams?.id, title: "Chi tiết bài học" }) },
  // Class Committee endpoints
  { key: "get_class_committee_context", method: "GET", path: "/students/me/class-committee-context", module: "class_committee", mock: () => ({ classId: null, className: null, officerRole: null, isOfficer: false }) },
  { key: "get_class_committee_violations", method: "GET", path: "/class-committee/:classId/violations", module: "class_committee", mock: () => ({ totalViolations: 0, totalAbsent: 0, violations: [], mostTroubledSubject: null, evaluationCount: 0 }) },
  { key: "get_class_committee_lesson_evaluations", method: "GET", path: "/class-committee/:classId/lesson-evaluations", module: "class_committee", mock: () => ([]) },
];

const createEndpointCaller = (endpoint) => async (input = {}) => {
  const shouldMock = input.mock !== false;
  
  console.log(`[studentService] Calling ${endpoint.key} (path: ${endpoint.path}), shouldMock: ${shouldMock}`);

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
    if (response && response.success && Array.isArray(response.data)) {
      const PERIOD_TIME = {
        1: "07:00", 2: "07:50", 3: "08:45", 4: "09:35", 5: "10:30",
        6: "13:00", 7: "13:50", 8: "14:45", 9: "15:35", 10: "16:25",
      };

      return response.data.map((p, idx) => {
        const beToFeDayMap = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 1: 6 };
        const dayIdx = beToFeDayMap[p.day_of_week] ?? 0;
        const dayKey = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayIdx];

        let periodNum = p.period_number;
        if (!periodNum) {
          let timeStr = "";
          if (p.start_time) {
            const s = String(p.start_time);
            timeStr = s.includes("T") ? s.split("T")[1].slice(0, 5) : s.slice(0, 5);
          }
          
          periodNum = 1;
          for (const [pNum, pTime] of Object.entries(PERIOD_TIME)) {
            if (pTime === timeStr) {
              periodNum = parseInt(pNum);
              break;
            }
          }
        }

        const subjectName = p.class_teacher_subject?.subject_assignments?.display_name || "Môn học";
        
        const teacherObj = p.class_teacher_subject?.teachers;
        let teacherName = "Chưa phân công";
        if (teacherObj) {
          const surname = teacherObj.surname || "";
          const givenName = teacherObj.given_name || "";
          const initials = surname.split(" ").filter(Boolean).map(s => s[0].toUpperCase()).join(".");
          teacherName = `Thầy ${initials ? initials + "." : ""}${givenName}`;
        }
        
        return {
          id: p.id || `lesson-${idx}`,
          day: dayKey,
          periodStart: periodNum,
          periodEnd: periodNum,
          subject: subjectName,
          teacher: teacherName,
          room: p.room || "—",
          status: p.status || "normal",
          mode: p.mode || "offline",
          color: p.color || (subjectName.includes("Toán") ? "teal" : subjectName.includes("Văn") ? "pink" : "blue"),
        };
      });
    }
    return [];
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
  // Class Committee
  getClassCommitteeContext: (input) => endpointCallers.get_class_committee_context(input),
  getClassViolations: (input) => endpointCallers.get_class_committee_violations(input),
  getClassLessonEvaluations: (input) => endpointCallers.get_class_committee_lesson_evaluations(input),
};

export default studentService;


