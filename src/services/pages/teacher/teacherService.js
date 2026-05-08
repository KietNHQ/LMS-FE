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
  summary: {
    teachingClasses: 4,
    publishedLessons: 8,
    pendingLessons: 2,
    upcomingEvents: 3,
  },
  upcomingSchedule: [
    { id: 1, title: "10A1 - Toán", time: "Tiết 2", date: "2026-04-22" },
    { id: 2, title: "11A2 - Toán", time: "Tiết 4", date: "2026-04-23" },
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
  { key: "get_dashboard_teacher", method: "GET", path: "/dashboard/teacher", module: "dashboard", mock: () => TEACHER_DASHBOARD_MOCK },
  { key: "get_teachers_by_id", method: "GET", path: "/teachers/:id", module: "teacher", mock: () => TEACHER_PROFILE_MOCK },
  { key: "get_teachers_by_id_classes", method: "GET", path: "/teachers/:id/classes", module: "teacher", mock: () => TEACHER_CLASSES_MOCK },
  { key: "get_teachers_by_id_subjects", method: "GET", path: "/teachers/:id/subjects", module: "teacher", mock: () => TEACHER_SUBJECTS_MOCK },
  { key: "get_classes", method: "GET", path: "/classes", module: "classes", mock: () => TEACHER_CLASSES_MOCK },
  { key: "get_classes_by_id", method: "GET", path: "/classes/:id", module: "classes", mock: (input) => {
      const matched = TEACHER_CLASSES_MOCK.find((item) => `${item.id}` === `${input.pathParams?.id}`);
      return matched ? { ...matched } : null;
    } },
  { key: "get_classes_by_id_students", method: "GET", path: "/classes/:id/students", module: "classes", mock: () => ([{ id: 1, name: "Nguyễn Văn A", status: "Đang học" }, { id: 2, name: "Trần Thị B", status: "Đang học" }]) },
  { key: "get_classes_by_id_subjects", method: "GET", path: "/classes/:id/subjects", module: "classes", mock: () => ([{ id: 1, name: "Toán" }, { id: 2, name: "Văn" }]) },
  { key: "get_classes_by_id_schedule", method: "GET", path: "/classes/:id/schedule", module: "classes", mock: () => ([{ id: 1, title: "Tiết 1 - Toán" }, { id: 2, title: "Tiết 2 - Văn" }]) },
  { key: "get_lessons", method: "GET", path: "/lessons", module: "lessons", mock: () => TEACHER_LESSONS_MOCK },
  { key: "get_lessons_by_id", method: "GET", path: "/lessons/:id", module: "lessons", mock: (input) => TEACHER_LESSONS_MOCK.find((item) => `${item.id}` === `${input.pathParams?.id}`) || null },
  { key: "post_lessons", method: "POST", path: "/lessons", module: "lessons", mock: (input) => ({ id: Date.now(), ...(input.body || {}), status: "Bản nháp" }) },
  { key: "put_lessons_by_id", method: "PUT", path: "/lessons/:id", module: "lessons", mock: (input) => ({ id: input.pathParams?.id, ...(input.body || {}) }) },
  { key: "delete_lessons_by_id", method: "DELETE", path: "/lessons/:id", module: "lessons", mock: (input) => ({ id: input.pathParams?.id, deleted: true }) },
  { key: "post_lessons_by_id_publish", method: "POST", path: "/lessons/:id/publish", module: "lessons", mock: (input) => ({ id: input.pathParams?.id, status: "Đã xuất bản" }) },
  { 
    key: "get_quizzes", 
    method: "GET", 
    path: "/quizzes", 
    module: "quiz", 
    mock: () => ({
      items: TEACHER_QUIZZES_MOCK,
      total: TEACHER_QUIZZES_MOCK.length
    }) 
  },
  { key: "get_notifications", method: "GET", path: "/notifications/my", module: "notifications", mock: () => ([]) },
  { key: "get_tickets", method: "GET", path: "/communications/tickets", module: "support", mock: () => ([]) },
  { key: "post_tickets", method: "POST", path: "/communications/tickets", module: "support", mock: (input) => ({ id: Date.now(), ...input.body, status: "open" }) },
  { 
    key: "get_timetable", 
    method: "GET", 
    path: "/timetable", 
    module: "timetable", 
    mock: () => ([
      {
        id: 1,
        day_of_week: "Monday",
        period_number: 1,
        subject_name: "Toán",
        subject_code: "Toan",
        class_name: "10A1",
        room_name: "P201",
        notes: "Kiểm tra 15 phút Chương 1",
        status: "normal",
        color: "teal"
      },
      {
        id: 2,
        day_of_week: "Monday",
        period_number: 2,
        subject_name: "Toán",
        subject_code: "Toan",
        class_name: "10A1",
        room_name: "P201",
        notes: "Luyện tập hàm số bậc nhất",
        status: "normal",
        color: "teal"
      },
      {
        id: 3,
        day_of_week: "Tuesday",
        period_number: 3,
        subject_name: "Vật Lý",
        subject_code: "VatLy",
        class_name: "10A2",
        room_name: "P204",
        notes: "Định luật bảo toàn cơ năng",
        status: "normal",
        color: "orange"
      }
    ]) 
  },
  { key: "get_grades_class", method: "GET", path: "/grades/class/:classId", module: "grades", mock: () => ([]) },
  { key: "post_grades_bulk", method: "POST", path: "/grades/bulk", module: "grades", mock: (input) => input.body },
  { key: "put_grades_by_id", method: "PUT", path: "/grades/:id", module: "grades", mock: (input) => ({ id: input.pathParams?.id, ...input.body }) },
  { key: "get_grade_items", method: "GET", path: "/grade-items", module: "grades", mock: () => ([]) },
  { 
    key: "get_chat_contacts", 
    method: "GET", 
    path: "/chat/contacts", 
    module: "chat", 
    mock: () => ([
      { 
        id: "api-mock-1", 
        name: "Lớp 10A1 - Group Chat", 
        subLabel: "Phụ huynh & Giáo viên", 
        avatar: "10", 
        type: "homeroom", 
        roomId: "homeroom",
        isMockData: true 
      },
      { 
        id: "api-mock-2", 
        name: "Hỗ trợ Kỹ thuật", 
        subLabel: "LMS Support Team", 
        avatar: "IT", 
        type: "technical", 
        roomId: "technical",
        isMockData: true 
      }
    ]) 
  },
  { key: "get_chat_messages", method: "GET", path: "/chat/messages/:targetId", module: "chat", mock: () => ([]) },
  { key: "post_chat_message", method: "POST", path: "/chat/messages", module: "chat", mock: (input) => ({ id: Date.now(), ...input.body }) },
  { key: "get_faqs", method: "GET", path: "/support/faqs", module: "support", mock: () => ([]) },
];

const createEndpointCaller = (endpoint) => {
  return async (input = {}) => {
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
  getClassById: (input) => endpointCallers.get_classes_by_id(input),
  getClassStudents: (input) => endpointCallers.get_classes_by_id_students(input),
  getClassSubjects: (input) => endpointCallers.get_classes_by_id_subjects(input),
  getClassSchedule: (input) => endpointCallers.get_classes_by_id_schedule(input),
  listLessons: (input) => endpointCallers.get_lessons(input),
  getLessonById: (input) => endpointCallers.get_lessons_by_id(input),
  createLesson: (input) => endpointCallers.post_lessons(input),
  updateLesson: (input) => endpointCallers.put_lessons_by_id(input),
  deleteLesson: (input) => endpointCallers.delete_lessons_by_id(input),
  publishLesson: (input) => endpointCallers.post_lessons_by_id_publish(input),
  listQuizzes: (input) => endpointCallers.get_quizzes(input),
  getNotifications: (input) => endpointCallers.get_notifications(input),
  getTickets: (input) => endpointCallers.get_tickets(input),
  createTicket: (input) => endpointCallers.post_tickets(input),
  getTimetable: (input) => endpointCallers.get_timetable(input),
  getGradesByClass: (input) => endpointCallers.get_grades_class(input),
  bulkUpdateGrades: (input) => endpointCallers.post_grades_bulk(input),
  updateGrade: (input) => endpointCallers.put_grades_by_id(input),
  listGradeItems: (input) => endpointCallers.get_grade_items(input),
  getChatContacts: (input) => endpointCallers.get_chat_contacts(input),
  getChatMessages: (input) => endpointCallers.get_chat_messages(input),
  sendMessage: (input) => endpointCallers.post_chat_message(input),
  getFaqs: (input) => endpointCallers.get_faqs(input),
  endpointCallers,
};

export default teacherService;


