import axiosClient from "../../shared/http/axiosClient";

const DEFAULT_DELAY_MS = 120;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fillPathParams = (path, pathParams = {}) => {
  return path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    const value = pathParams[key];
    if (value === undefined || value === null) {
      throw new Error(`Missing path param: ${key}`);
    }
    return encodeURIComponent(String(value));
  });
};

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
  message: "Temporary teacher mock response. Set mock=false to call backend.",
});

const TEACHER_DASHBOARD_MOCK = {
  stats: {
    totalTeachingClasses: 4,
    totalHomeroomClasses: 1,
    publishedLessons: 8,
    pendingLessons: 2,
    upcomingEvents: 3,
  },
  classes: [
    { id: 1, class_name: "10A1", time: "Tiết 2", date: "2026-04-22", isHomeroom: true, actual_students: 40 },
    { id: 2, class_name: "11A2", time: "Tiết 4", date: "2026-04-23", actual_students: 38 },
  ],
  recentActivities: [
    { id: 1, title: "Đã đăng bài giảng Hàm số bậc nhất" },
    { id: 2, title: "Duyệt 3 bài nộp quiz" },
  ],
};

const TEACHER_PROFILE_MOCK = {
  id: 12,
  fullName: "Lê Minh Hoàng",
  email: "leminhhoang@example.com",
  subject: "Toán",
  role: "teacher",
  classes: ["10A1", "11A2", "12A1"],
};

const TEACHER_CLASSES_MOCK = [
  {
    id: 101,
    name: "10A1",
    grade: "Khối 10",
    room: "B203",
    students: 42,
    subjects: ["Toán", "Lý", "Hóa"],
    teacher: "Lê Minh Hoàng",
    status: "active",
  },
  {
    id: 102,
    name: "11A2",
    grade: "Khối 11",
    room: "B205",
    students: 41,
    subjects: ["Toán", "Anh", "Văn"],
    teacher: "Lê Minh Hoàng",
    status: "active",
  },
];

const TEACHER_SUBJECTS_MOCK = [
  { id: 1, name: "Toán", block: "Khối 10", weeklyPeriods: 4 },
  { id: 2, name: "Toán", block: "Khối 11", weeklyPeriods: 4 },
  { id: 3, name: "Toán", block: "Khối 12", weeklyPeriods: 4 },
];

const TEACHER_QUIZZES_MOCK = [
  {
    id: 1,
    title: "Toán 10 - Kiểm tra 15 phút Chương 1",
    description: "Bài kiểm tra nhanh chương 1 toán lớp 10",
    subject: "Toán",
    grade: "Khối 10",
    questions: 3,
    durationMinutes: 15,
    status: "open",
    isPublished: true,
    createdAt: "2024-03-20T00:00:00Z",
    createdByName: "Lê Minh Hoàng",
    createdByRole: "teacher",
    quizType: "practice",
    className: "10A1",
    submissionCount: 2,
    gradingStatus: "pending",
  },
  {
    id: 2,
    title: "Vật Lý 10 - Kiểm tra 1 tiết Chương 1",
    description: "Bài kiểm tra chương 1 vật lý lớp 10",
    subject: "Vật Lý",
    grade: "Khối 10",
    questions: 15,
    durationMinutes: 45,
    status: "open",
    isPublished: true,
    createdAt: "2024-03-19T00:00:00Z",
    createdByName: "Quản trị viên",
    createdByRole: "admin",
    quizType: "exam",
    className: "10A2",
    submissionCount: 1,
    gradingStatus: "pending",
  },
  {
    id: 3,
    title: "Hóa Học 10 - Chương 2",
    description: "Bài kiểm tra chương 2 hóa học lớp 10",
    subject: "Hóa Học",
    grade: "Khối 10",
    questions: 18,
    durationMinutes: 45,
    status: "hidden",
    isPublished: false,
    createdAt: "2024-03-18T00:00:00Z",
    createdByName: "Lê Minh Hoàng",
    createdByRole: "teacher",
    quizType: "practice",
    className: "10A3",
    submissionCount: 0,
    gradingStatus: "no-submission",
  },
];

const TEACHER_LESSONS_MOCK = [
  {
    id: 1,
    title: "Hàm số bậc nhất",
    gradeBlock: "Khối 10",
    className: "10A1",
    chapter: "Chương 1",
    date: "2026-04-18",
    period: "Tiết 2",
    room: "Phòng B203",
    status: "Đã xuất bản",
    isPinned: true,
    objective: "Học sinh nhớ được định nghĩa và nhận dạng đồ thị hàm số bậc nhất.",
    content: "Giới thiệu dạng hàm số, phân tích hệ số a và b, luyện tập vẽ đồ thị qua 4 ví dụ cơ bản.",
    materials: "Slide chương 1, phiếu học tập số 03, bảng phụ nhóm.",
    homework: "Bài 1-4 trang 29, nộp trước 20:00 ngày hôm sau trên LMS.",
    attachments: [
      { name: "giao_an_ham_so_bac_nhat.docx", size: 246000 },
      { name: "slide_ham_so_bac_nhat.pptx", size: 1445000 },
    ],
  },
  {
    id: 2,
    title: "Bài tập ứng dụng hàm số",
    gradeBlock: "Khối 11",
    className: "11A2",
    chapter: "Chương 1",
    date: "2026-04-20",
    period: "Tiết 4",
    room: "Phòng B205",
    status: "Bản nháp",
    objective: "Rèn luyện kỹ năng lập bảng biến thiên và vẽ đồ thị nhanh.",
    content: "Tổ chức hoạt động nhóm 2 vòng bài tập từ cơ bản đến nâng cao, chốt đáp án theo rubric.",
    materials: "Bộ bài tập mức A-B-C, máy chiếu, bảng từ mini.",
    homework: "Hoàn thành đề luyện tập số 2, hạn nộp 2 ngày.",
    attachments: [{ name: "de_luyen_tap_so_2.pdf", size: 689000 }],
  },
  {
    id: 3,
    title: "Ôn tập chương 1",
    gradeBlock: "Khối 12",
    className: "12A1",
    chapter: "Chương 1",
    date: "2026-04-23",
    period: "Tiết 1",
    room: "Phòng B203",
    status: "Chờ duyệt",
    objective: "Hệ thống hóa kiến thức trọng tâm trước bài kiểm tra ngắn.",
    content: "Ôn theo sơ đồ tư duy, chữa lỗi sai phổ biến, mini quiz 10 phút cuối tiết.",
    materials: "Sơ đồ chương 1, bộ câu hỏi trắc nghiệm nhanh.",
    homework: "Xem lại các bài sai trong quiz, ghi chú nguyên nhân sai.",
    attachments: [],
  },
];

const teacherEndpointRegistry = [
  { key: "get_dashboard_teacher", method: "GET", path: "/dashboard/teacher", module: "dashboard", mock: false },
  { key: "get_teachers_by_id", method: "GET", path: "/teachers/:id", module: "teacher", mock: false },
  { key: "get_teachers_by_id_classes", method: "GET", path: "/teachers/:id/classes", module: "teacher", mock: false },
  { key: "get_teachers_by_id_subjects", method: "GET", path: "/teachers/:id/subjects", module: "teacher", mock: false },
  { key: "get_classes", method: "GET", path: "/classes", module: "classes", mock: false },
  { key: "get_grade_levels", method: "GET", path: "/grade-levels", module: "gradeLevels", mock: false },
  { key: "get_classes_by_id", method: "GET", path: "/classes/:id", module: "classes", mock: false },
  { key: "get_classes_by_id_students", method: "GET", path: "/classes/:id/students", module: "classes", mock: false },
  { key: "get_classes_by_id_subjects", method: "GET", path: "/classes/:id/subjects", module: "classes", mock: false },
  { key: "get_classes_by_id_schedule", method: "GET", path: "/classes/:id/schedule", module: "classes", mock: false },
  { key: "get_school_years", method: "GET", path: "/school-years", module: "schoolYears", mock: false },
  { key: "get_school_years_current", method: "GET", path: "/school-years/current", module: "schoolYears", mock: false },
  { key: "get_semesters", method: "GET", path: "/semesters", module: "schoolYears", mock: false },
  { key: "get_semesters_current", method: "GET", path: "/semesters/current", module: "schoolYears", mock: false },
  { key: "get_lessons", method: "GET", path: "/lessons", module: "lessons" },
  { key: "get_lessons_by_id", method: "GET", path: "/lessons/:id", module: "lessons" },
  { key: "post_lessons", method: "POST", path: "/lessons", module: "lessons" },
  { key: "put_lessons_by_id", method: "PUT", path: "/lessons/:id", module: "lessons" },
  { key: "delete_lessons_by_id", method: "DELETE", path: "/lessons/:id", module: "lessons" },
  { key: "post_lessons_by_id_publish", method: "POST", path: "/lessons/:id/publish", module: "lessons" },
  { key: "post_lessons_upload", method: "POST", path: "/lessons/upload", module: "lessons" },
  { key: "post_school_events", method: "POST", path: "/school-events", module: "events", mock: false },
  {
    key: "get_quizzes", 
    method: "GET", 
    path: "/quizzes", 
    module: "quiz", 
    mock: false
  },
  { key: "get_notifications", method: "GET", path: "/notifications/my", module: "notifications", mock: false },
  { key: "put_notifications_my_read_all", method: "PUT", path: "/notifications/my/read-all", module: "notifications", mock: false },
  { key: "put_notifications_my_by_id_read", method: "PUT", path: "/notifications/my/:id/read", module: "notifications", mock: false },
  { key: "patch_notifications_my_by_id_toggle_important", method: "PATCH", path: "/notifications/my/:id/toggle-important", module: "notifications", mock: false },
  // Leave Requests - Real API endpoints (no mock)
  { key: "get_class_leave_requests", method: "GET", path: "/leave-requests/classes/:classId/leave-requests", module: "leave" },
  { key: "get_approved_leaves_by_date", method: "GET", path: "/leave-requests/classes/:classId/leave-requests/approved-on-date", module: "leave" },
  { key: "patch_leave_request_status", method: "PATCH", path: "/leave-requests/:id/approve", module: "leave" },
  { 
    key: "get_timetable", 
    method: "GET", 
    path: "/teachers/me/timetable", 
    module: "timetable", 
    mock: false
  },
  { 
    key: "get_grades_class", 
    method: "GET", 
    path: "/grades/class/:classId", 
    module: "grades", 
    mock: false
  },
  { 
    key: "post_grades_bulk", 
    method: "POST", 
    path: "/grades/bulk", 
    module: "grades", 
    mock: false
  },
  { key: "put_grades_by_id", method: "PUT", path: "/grades/:id", module: "grades", mock: false },
  {
    key: "post_grades_finalize_class",
    method: "POST",
    path: "/grades/finalize-class",
    module: "grades",
    mock: false
  },
  {
    key: "post_grades_submit_batch",
    method: "POST",
    path: "/grades/submit-batch",
    module: "grades",
    mock: false
  },
  {
    key: "post_grades_retract",
    method: "POST",
    path: "/grades/retract-batch",
    module: "grades",
    mock: false
  },
  {
    key: "get_grades_lock_status",
    method: "GET",
    path: "/grades/lock-status",
    module: "grades",
    mock: false
  },
  {
    key: "get_pending_grade_approvals",
    method: "GET",
    path: "/grades/pending-approvals",
    module: "grades",
    mock: false
  },
  {
    key: "post_grades_approve_batch",
    method: "POST",
    path: "/grades/approve-batch",
    module: "grades",
    mock: false
  },
  { key: "teacher_upsert_grades", method: "POST", path: "/grades/teacher-upsert", module: "grades", mock: false },
  { key: "get_grade_items", method: "GET", path: "/grade-items", module: "grades", mock: false },
  { 
    key: "get_chat_contacts", 
    method: "GET", 
    path: "/chat/contacts", 
    module: "chat", 
    mock: false
  },
  { key: "get_chat_messages", method: "GET", path: "/chat/messages/:targetId", module: "chat", mock: false },
  { key: "post_chat_message", method: "POST", path: "/chat/messages", module: "chat", mock: false },
  { key: "start_human_chat", method: "POST", path: "/chat/human/start", module: "chat" },
  { key: "get_human_messages", method: "GET", path: "/chat/human/messages/:conversationId", module: "chat" },
  { key: "get_human_conversations", method: "GET", path: "/chat/human/conversations", module: "chat" },
  { key: "get_human_conversations_by_classid", method: "GET", path: "/chat/human/conversations", module: "chat" },
  { key: "get_human_class_parents", method: "GET", path: "/chat/human/class/:classId/parents", module: "chat" },
  { key: "get_human_conversations_by_conversationid_messages", method: "GET", path: "/chat/human/messages/:conversationId", module: "chat" },
  { key: "post_human_conversations_by_parentid_messages", method: "POST", path: "/chat/human/parent/:parentId/message", module: "chat" },
  { key: "post_human_conversations_by_conversationid_read", method: "POST", path: "/chat/human/read/:conversationId", module: "chat" },
  { key: "send_human_message", method: "POST", path: "/chat/human/message", module: "chat" },
  { key: "delete_human_message", method: "DELETE", path: "/chat/human/messages/:messageId", module: "chat" },
  { key: "get_faqs", method: "GET", path: "/support/faqs", module: "support", mock: () => ([]) },
  { key: "post_ai_chat", method: "POST", path: "/support/ai/chat", module: "support" },
  { key: "post_attendance", method: "POST", path: "/teachers/attendance", module: "teacher", mock: (input) => input.body },
  { key: "post_lesson_evaluation", method: "POST", path: "/teachers/lesson-evaluations", module: "teacher" },
  { key: "put_lesson_evaluation", method: "PUT", path: "/teachers/lesson-evaluations/:id", module: "teacher" },
  { key: "delete_lesson_evaluation", method: "DELETE", path: "/teachers/lesson-evaluations/:id", module: "teacher" },
  { key: "get_lesson_evaluations", method: "GET", path: "/teachers/classes/:classId/lesson-evaluations", module: "teacher", mock: () => ([]) },
  { key: "get_current_schedule", method: "GET", path: "/teachers/classes/:classId/current-schedule", module: "teacher", mock: () => (null) },
  { key: "get_teaching_days", method: "GET", path: "/teachers/classes/:classId/teaching-days", module: "teacher", mock: false },
  { key: "get_homeroom_classes", method: "GET", path: "/teachers/:id/homeroom-classes", module: "teacher", mock: false },
  { key: "get_academic_summary", method: "GET", path: "/classes/:id/academic-summary", module: "classes", mock: false },
  { key: "get_conduct_summary_class", method: "GET", path: "/conduct-summary/class/:classId/summary", module: "conduct", mock: false },
  { key: "patch_class_officers", method: "PATCH", path: "/classes/:id/officers", module: "classes" },
  { key: "post_class_broadcast", method: "POST", path: "/notifications/class/:id/broadcast", module: "notifications", mock: false },
  { key: "get_consolidated_homeroom", method: "GET", path: "/teachers/:id/homeroom-dashboard", module: "teacher" },
  { key: "get_consolidated_teaching_classes", method: "GET", path: "/teachers/me/teaching-classes", module: "teacher" },
  { key: "post_class_activity", method: "POST", path: "/classes/:id/activities", module: "classes" },
  { key: "put_class_activity", method: "PUT", path: "/classes/:id/activities/:activityId", module: "classes" },
  { key: "delete_class_activity", method: "DELETE", path: "/classes/:id/activities/:activityId", module: "classes" },
  // Class Committee endpoints (for AcademicVicePresidentTab)
  { key: "get_committee_lesson_evaluations", method: "GET", path: "/class-committee/:classId/lesson-evaluations", module: "classes", mock: false },
];

const createEndpointCaller = (endpoint) => {
  return async (input = {}) => {
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
};

const endpointCallers = Object.fromEntries(
  teacherEndpointRegistry.map((endpoint) => [endpoint.key, createEndpointCaller(endpoint)]),
);

const modules = teacherEndpointRegistry.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) {
    acc[endpoint.module] = [];
  }
  acc[endpoint.module].push(endpoint);
  return acc;
}, {});

const callByKey = (key, input = {}) => {
  const endpoint = teacherEndpointRegistry.find((item) => item.key === key);
  if (!endpoint) {
    throw new Error(`Teacher endpoint not found: ${key}`);
  }
  return createEndpointCaller(endpoint)(input);
};

const moduleServices = teacherEndpointRegistry.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) {
    acc[endpoint.module] = {};
  }
  acc[endpoint.module][endpoint.key] = endpointCallers[endpoint.key];
  return acc;
}, {});

const findEndpoint = (method, path) => {
  const endpoint = teacherEndpointRegistry.find((item) => item.method === method && item.path === path);
  if (!endpoint) {
    throw new Error(`Teacher endpoint not found: ${method} ${path}`);
  }
  return endpoint;
};

const call = (method, path, input = {}) => createEndpointCaller(findEndpoint(method, path))(input);

export const teacherService = {
  endpoints: teacherEndpointRegistry,
  modules,
  moduleServices,
  callByKey,
  call,
  getDashboard: (input) => endpointCallers.get_dashboard_teacher(input),
  getTeacherById: (input) => endpointCallers.get_teachers_by_id(input),
  getTeacherClasses: (input) => endpointCallers.get_teachers_by_id_classes(input),
  getTeacherSubjects: (input) => endpointCallers.get_teachers_by_id_subjects(input),
  listClasses: (input) => endpointCallers.get_classes(input),
  getGradeLevels: (input) => endpointCallers.get_grade_levels(input),
  getClassById: (input) => endpointCallers.get_classes_by_id(input),
  getClassStudents: (input) => endpointCallers.get_classes_by_id_students(input),
  getClassSubjects: (input) => endpointCallers.get_classes_by_id_subjects(input),
  getClassSchedule: (input) => endpointCallers.get_classes_by_id_schedule(input),
  listSchoolYears: (input) => endpointCallers.get_school_years(input),
  getCurrentSchoolYear: (input) => endpointCallers.get_school_years_current(input),
  listSemesters: (input) => endpointCallers.get_semesters(input),
  getCurrentSemester: (input) => endpointCallers.get_semesters_current(input),
  listLessons: (input) => endpointCallers.get_lessons(input),
  getLessonById: (input) => endpointCallers.get_lessons_by_id(input),
  createLesson: (input) => endpointCallers.post_lessons(input),
  updateLesson: (input) => endpointCallers.put_lessons_by_id(input),
  deleteLesson: (input) => endpointCallers.delete_lessons_by_id(input),
  publishLesson: (input) => endpointCallers.post_lessons_by_id_publish(input),
  uploadLessonAttachment: (input) => endpointCallers.post_lessons_upload(input),
  createSchoolEvent: (input) => endpointCallers.post_school_events(input),
  listQuizzes: (input) => endpointCallers.get_quizzes(input),
  getNotifications: (input) => endpointCallers.get_notifications(input),
  markAllNotificationsRead: (input) => endpointCallers.put_notifications_my_read_all(input),
  markNotificationRead: (input) => endpointCallers.put_notifications_my_by_id_read(input),
  toggleNotificationImportant: (input) => endpointCallers.patch_notifications_my_by_id_toggle_important(input),
  getClassLeaveRequests: (input) => endpointCallers.get_class_leave_requests(input),
  getApprovedLeavesByDate: (input) => endpointCallers.get_approved_leaves_by_date(input),
  updateLeaveRequestStatus: (input) => endpointCallers.patch_leave_request_status(input),
  getTimetable: (input) => endpointCallers.get_timetable(input),
  getGradesByClass: (input) => endpointCallers.get_grades_class(input),
  bulkUpdateGrades: (input) => endpointCallers.post_grades_bulk(input),
  updateGrade: (input) => endpointCallers.put_grades_by_id(input),
  teacherUpsertGrades: (input) => endpointCallers.teacher_upsert_grades(input),
  listGradeItems: (input) => endpointCallers.get_grade_items(input),
  finalizeClassGrades: (input) => endpointCallers.post_grades_finalize_class(input),
  submitBatchGrades: (input) => endpointCallers.post_grades_submit_batch(input),
  retractGrade: (input) => endpointCallers.post_grades_retract(input),
  getGradesLockStatus: (input) => endpointCallers.get_grades_lock_status(input),
  getPendingGradeApprovals: (input) => endpointCallers.get_pending_grade_approvals(input),
  approveGradeBatch: (input) => endpointCallers.post_grades_approve_batch(input),
  getChatContacts: (input) => endpointCallers.get_chat_contacts(input),
  getChatMessages: (input) => endpointCallers.get_chat_messages(input),
  sendMessage: (input) => endpointCallers.post_chat_message(input),
  startHumanChat: (input) => endpointCallers.start_human_chat(input),
  getHumanConversations: (input) => endpointCallers.get_human_conversations(input),
  getHumanConversationsByClassId: (input) => endpointCallers.get_human_conversations_by_classid(input),
  getClassParents: (input) => endpointCallers.get_human_class_parents(input),
  getHumanMessages: (input) => endpointCallers.get_human_conversations_by_conversationid_messages(input),
  sendMessageToParent: (input) => endpointCallers.post_human_conversations_by_parentid_messages(input),
  markChatAsRead: (input) => endpointCallers.post_human_conversations_by_conversationid_read(input),
  sendHumanMessage: (input) => endpointCallers.send_human_message(input),
  deleteHumanMessage: (input) => endpointCallers.delete_human_message(input),
  getFaqs: (input) => endpointCallers.get_faqs(input),
  aiChat: (input) => endpointCallers.post_ai_chat(input),
  saveAttendance: (input) => endpointCallers.post_attendance(input),
  saveLessonEvaluation: (input) => endpointCallers.post_lesson_evaluation(input),
  updateLessonEvaluation: (input) => endpointCallers.put_lesson_evaluation(input),
  deleteLessonEvaluation: (input) => endpointCallers.delete_lesson_evaluation(input),
  getLessonEvaluations: (input) => endpointCallers.get_lesson_evaluations(input),
  getCurrentSchedule: (input) => endpointCallers.get_current_schedule(input),
  getTeachingDays: (input) => endpointCallers.get_teaching_days(input),
  getHomeroomClasses: (input) => endpointCallers.get_homeroom_classes(input),
  getAcademicSummary: (input) => endpointCallers.get_academic_summary(input),
  getConductClassSummary: (input) => endpointCallers.get_conduct_summary_class(input),
  assignOfficers: (input) => endpointCallers.patch_class_officers(input),
  broadcastToClass: (input) => endpointCallers.post_class_broadcast(input),
  getClassDetails: (input) => endpointCallers.get_classes_by_id(input),
  getConsolidatedHomeroom: (input) => endpointCallers.get_consolidated_homeroom(input),
  getConsolidatedTeachingClasses: (input) => endpointCallers.get_consolidated_teaching_classes(input),
  createClassActivity: (input) => endpointCallers.post_class_activity(input),
  updateClassActivity: (input) => endpointCallers.put_class_activity(input),
  deleteClassActivity: (input) => endpointCallers.delete_class_activity(input),
  getCommitteeLessonEvaluations: (input) => endpointCallers.get_committee_lesson_evaluations(input),
  endpointCallers,
};

export default teacherService;
