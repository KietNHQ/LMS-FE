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
  message: "Temporary parent mock response. Set mock=false to call backend.",
});

// ============================================================
// DATA MAPPERS: BE response → FE expected shape
// ============================================================

/**
 * Map BE /api/v1/guardians/me/children → FE children shape
 * BE returns: { id, student_code, given_name, surname, gender, className, classId,
 *                teacherName, schoolYear, schoolYearId, relationship, is_primary, ... }
 * FE expects: { id, name, studentId, className, schoolYear, status, homeroomTeacher, avatarLetter, ... }
 */
const mapChild = (child) => {
  // Support both BE format (given_name/surname) and mock format (name)
  const name = child.name || `${child.given_name || ""} ${child.surname || ""}`.trim();
  const letter = (child.name ? (child.name || "S")[0] : (child.given_name || name || "S")[0]).toUpperCase();
  return {
    id: child.id,
    name: name || child.studentName || "Học sinh",
    studentId: child.student_code || child.studentId,
    className: child.className || child.class_name || null,
    classId: child.classId || child.class_id || null,
    schoolYear: child.schoolYear || child.year_name || null,
    schoolYearId: child.schoolYearId || null,
    status: "Đang học",
    homeroomTeacher: child.teacherName || child.homeroomTeacher || null,
    avatarLetter: letter,
    avatarColor: "linear-gradient(135deg, #a67cff, #7c4dff)",
    gender: child.gender,
    relationship: child.relationship,
    isPrimary: child.is_primary,
  };
};

/**
 * Map BE /api/v1/guardians/me/children → FE dashboard children shape
 * Same as mapChild but also includes averageScores stub (grades fetched separately)
 */
const mapDashboardChild = (child) => ({
  ...mapChild(child),
  averageScores: { semester1: null, semester2: null, fullYear: null },
});

/**
 * Map BE GET /api/chat/human/conversations → FE conversation shape
 * BE returns: { id, title, other_user_id, other_full_name, other_user_role,
 *                message_count, last_message, updated_at, created_at }
 * FE expects: { id, userId, name, role, className, unread, lastMessage, updatedAt }
 */
const mapConversation = (conv) => ({
  id: conv.id,
  userId: conv.other_user_id || conv.id,
  name: conv.other_full_name || conv.title || "Giáo viên",
  role: conv.other_user_role === "teacher" ? "Giáo viên chủ nhiệm" : (conv.other_user_role || ""),
  className: conv.class_name || null,
  unread: conv.unread_count || 0,
  lastMessage: conv.last_message || "",
  updatedAt: conv.updated_at || conv.created_at || null,
});

/**
 * Map BE GET /api/notifications/my → FE notification shape
 * BE returns: { id, title, content, type, priority, is_read, read_at, sent_at, ... }
 * FE expects: { id, title, content, date, unread, class, important }
 */
const mapNotification = (n) => ({
  id: n.id,
  title: n.title,
  content: n.content,
  date: n.sent_at || n.created_at || null,
  unread: n.is_read === false || n.is_read === null,
  class: n.target_id ? String(n.target_id) : "parent",
  important: n.is_important || false,
  type: n.type,
  priority: n.priority,
});

// ============================================================
// MOCK DATA
// ============================================================

const PARENT_CHILDREN_MOCK = [
  {
    id: "child1",
    name: "Nguyễn Minh Tuấn",
    studentId: "STU1024",
    className: "10A1",
    schoolYear: "2025-2026",
    status: "Đang học",
    parentName: "Nguyễn Văn Phụ Huynh",
    homeroomTeacher: "Trần Thị Lan Anh",
    avatarLetter: "T",
    avatarColor: "linear-gradient(135deg, #a67cff, #7c4dff)",
    averageScores: { semester1: "8.4", semester2: "8.8", fullYear: "8.6" },
  },
  {
    id: "child2",
    name: "Nguyễn Thị Ngọc Hà",
    studentId: "STU0891",
    className: "12A2",
    schoolYear: "2025-2026",
    status: "Đang học",
    parentName: "Nguyễn Văn Phụ Huynh",
    homeroomTeacher: "Lê Minh Hoàng",
    avatarLetter: "H",
    avatarColor: "linear-gradient(135deg, #f97316, #ef4444)",
    averageScores: { semester1: "9.1", semester2: "9.3", fullYear: "9.2" },
  },
];

const PARENT_DASHBOARD_MOCK = {
  parentName: "Nguyễn Văn Phụ Huynh",
  children: PARENT_CHILDREN_MOCK,
  summary: {
    notifications: 4,
    paymentsDue: 1,
    attendanceAlerts: 2,
    upcomingEvents: 3,
  },
  events: [
    { id: 1, title: "Họp phụ huynh", date: "2026-03-15", type: "meeting" },
    { id: 2, title: "Kiểm tra Toán", date: "2026-03-17", type: "exam" },
  ],
  schedule: [
    { id: 1, day: "Thứ 2", time: "08:00 - 09:30", subject: "Toán học", room: "A101" },
    { id: 2, day: "Thứ 3", time: "09:45 - 11:15", subject: "Tiếng Anh", room: "B203" },
  ],
};

const PARENT_MESSAGES_MOCK = [
  {
    id: "conv-1",
    userId: "teacher-1",
    name: "Trần Thị Lan Anh",
    role: "Giáo viên chủ nhiệm",
    className: "10A1",
    unread: 2,
    lastMessage: "Mời phụ huynh theo dõi bảng điểm tuần này.",
    updatedAt: "2026-04-21T08:30:00.000Z",
  },
  {
    id: "conv-2",
    userId: "teacher-2",
    name: "Lê Minh Hoàng",
    role: "Giáo viên chủ nhiệm",
    className: "12A2",
    unread: 0,
    lastMessage: "Đã cập nhật lịch kiểm tra thử đại học.",
    updatedAt: "2026-04-20T12:10:00.000Z",
  },
];

const PARENT_NOTIFICATIONS_MOCK = [
  { id: 1, title: "Lịch thi HK2", content: "Thi bắt đầu từ ngày 20/05/2025", date: "2025-01-15", unread: true, class: "10", important: true },
  { id: 2, title: "Cập nhật điểm", content: "Điểm học kỳ đã cập nhật", date: "2025-01-08", unread: true, class: "11", important: false },
  { id: 3, title: "Thông báo hệ thống", content: "Bảo trì hệ thống LMS", date: "2025-01-18", unread: true, class: "12", important: false },
  { id: 4, title: "Họp phụ huynh", content: "Nhà trường tổ chức họp phụ huynh", date: "2025-01-20", unread: true, class: "parent", important: true },
];

const PARENT_PAYMENTS_MOCK = [
  {
    id: 1,
    title: "Học phí HK1",
    term: "Học kỳ 1",
    schoolYear: "2025-2026",
    grade: "Khối 10",
    className: "10A1",
    childName: "Nguyễn Minh Tuấn",
    deadline: "2025-09-30",
    feeItems: [
      { id: "f-1", name: "Học phí", note: "Bắt buộc", amount: 3800000 },
      { id: "f-2", name: "Bán trú", note: "Bắt buộc", amount: 700000 },
    ],
    description: "Khoản thu học kỳ 1 được tạo từ danh mục thu của nhà trường.",
    discountCode: "",
    discountAmount: 0,
    status: "paid",
    paidDate: "2025-09-25",
    paidAmount: 4500000,
    invoiceCode: "INV-HK1-2025-10A1-01",
  },
  {
    id: 2,
    title: "Học phí HK2",
    term: "Học kỳ 2",
    schoolYear: "2025-2026",
    grade: "Khối 12",
    className: "12A2",
    childName: "Nguyễn Thị Ngọc Hà",
    deadline: "2026-02-28",
    feeItems: [
      { id: "f-5", name: "Học phí", note: "Bắt buộc", amount: 4200000 },
      { id: "f-6", name: "Bán trú", note: "Bắt buộc", amount: 800000 },
    ],
    description: "Khoản thu học kỳ 2 cho học sinh lớp 12A2.",
    discountCode: "GIAM10",
    discountAmount: 500000,
    status: "unpaid",
    paidDate: "",
    paidAmount: 0,
    invoiceCode: "INV-HK2-2026-12A2-01",
  },
];

const PARENT_FAQS_MOCK = [
  { category: "Học tập", question: "Làm sao để theo dõi kết quả học tập của con?", answer: "Bạn mở mục Tổng quan con em hoặc Điểm số để xem chi tiết theo học kỳ.", popularity: 96 },
  { category: "Tài chính", question: "Phụ huynh thanh toán học phí cho con ở đâu?", answer: "Bạn có thể thanh toán trong mục Thanh toán hoặc liên hệ phòng tài vụ để được hỗ trợ.", popularity: 90 },
  { category: "Liên hệ", question: "Làm sao nhắn tin giáo viên chủ nhiệm?", answer: "Vào mục Liên lạc giáo viên chủ nhiệm và chọn cuộc trò chuyện cần trao đổi.", popularity: 86 },
  { category: "Điểm danh", question: "Có thể xem lịch sử điểm danh theo tháng không?", answer: "Có, hệ thống cho phép xem điểm danh tuần/tháng trong phần Tổng quan con em.", popularity: 84 },
  { category: "Thông báo", question: "Vì sao thông báo chưa đọc chưa cập nhật?", answer: "Hãy tải lại trang và kiểm tra mục Thông báo để đồng bộ số lượng chưa đọc mới nhất.", popularity: 75 },
  { category: "Tài khoản", question: "Quên mật khẩu tài khoản phụ huynh phải làm gì?", answer: "Sử dụng Quên mật khẩu ở trang đăng nhập hoặc liên hệ bộ phận hỗ trợ để cấp lại.", popularity: 88 },
];

// ============================================================
// API ENDPOINTS
// BE base URL is already embedded in axiosClient (e.g. /api/v1/...)
// ============================================================
const PARENT_ENDPOINTS = [
  // Children
  { key: "get_parent_dashboard", method: "GET", path: "/guardians/me/children", module: "dashboard" },
  { key: "get_parent_children", method: "GET", path: "/guardians/me/children", module: "children" },
  { key: "get_parent_child_by_id", method: "GET", path: "/guardians/me/children/:childId", module: "children" },
  // Grades, Attendance, Schedule via guardian endpoints
  { key: "get_parent_child_grades", method: "GET", path: "/guardians/me/children/:childId/grades", module: "children" },
  { key: "get_parent_child_attendance", method: "GET", path: "/guardians/me/children/:childId/attendance", module: "children" },
  { key: "get_parent_child_schedule", method: "GET", path: "/guardians/me/children/:childId/schedule", module: "children" },
  // Messages (human chat)
  { key: "get_parent_messages", method: "GET", path: "/chat/human/conversations", module: "messages" },
  { key: "post_parent_messages", method: "POST", path: "/chat/human/message", module: "messages" },
  { key: "get_parent_teachers", method: "GET", path: "/guardians/me/teachers", module: "messages" },
  { key: "get_parent_messages_history", method: "GET", path: "/chat/human/messages/:conversationId", module: "messages" },
  // Notifications
  { key: "get_parent_notifications", method: "GET", path: "/notifications/my", module: "notifications" },
  { key: "patch_parent_notifications_mark_all_read", method: "PUT", path: "/notifications/my/read-all", module: "notifications" },
  { key: "patch_parent_notifications_by_id_read", method: "PUT", path: "/notifications/my/:id/read", module: "notifications" },
  { key: "patch_parent_notifications_by_id_toggle", method: "PATCH", path: "/notifications/my/:id/toggle-important", module: "notifications" },
  // Payments
  { key: "get_parent_payments", method: "GET", path: "/guardians/me/payments", module: "payments" },
  { key: "get_parent_payments_by_id", method: "GET", path: "/finance/debts/:id", module: "payments" },
  { key: "post_parent_payments_by_id_pay", method: "POST", path: "/finance/debts/:id/pay", module: "payments" },
  { key: "post_parent_payments_apply_discount", method: "POST", path: "/guardians/me/payments/apply-discount", module: "payments" },
  // Support
  { key: "get_parent_faqs", method: "GET", path: "/guardians/me/support/faqs", module: "support" },
  { key: "post_parent_support_tickets", method: "POST", path: "/guardians/me/support/tickets", module: "support" },
  { key: "get_parent_support_tickets", method: "GET", path: "/guardians/me/support/tickets", module: "support" },
  // Leave Requests
  { key: "get_parent_leave_requests", method: "GET", path: "/guardians/me/leave-requests", module: "leave" },
  { key: "post_parent_leave_requests", method: "POST", path: "/guardians/me/leave-requests", module: "leave" },
];

// Mapper per endpoint key — applied to BE responses
const ENDPOINT_MAPPERS = {
  get_parent_children: (data) => {
    // BE returns { success: true, data: [...] } - interceptor unwraps to just data
    // But axiosClient interceptors return response.data, so we get the whole object
    const arr = Array.isArray(data) ? data : (data?.data || []);
    return arr.map(mapChild);
  },
  get_parent_dashboard: (data) => {
    if (!Array.isArray(data)) return null;
    return {
      children: data.map(mapDashboardChild),
      summary: { notifications: 0, paymentsDue: 0, attendanceAlerts: 0, upcomingEvents: 0 },
      events: [],
      schedule: [],
    };
  },
  get_parent_messages: (data) => {
    const convs = Array.isArray(data) ? data : (data?.data?.conversations || data?.conversations || []);
    return convs.map(mapConversation);
  },
  get_parent_teachers: (data) => {
    // BE returns: [{ studentId, studentName, classId, className, teacherId, teacherUserId, teacherName }]
    const teachers = Array.isArray(data) ? data : (data?.data || []);
    // Deduplicate by teacherId: group all children under same GVCN
    const map = {};
    for (const t of teachers) {
      const key = t.teacherUserId || t.teacherId;
      if (!map[key]) {
        map[key] = {
          id: `teacher-${key}`,
          teacherId: key,
          teacherUserId: t.teacherUserId,
          name: t.teacherName || "Giáo viên chủ nhiệm",
          classNames: [],
          children: [], // { studentId, studentName, className }
        };
      }
      // Accumulate child + class (avoid duplicate children if same student appears twice)
      const childExists = map[key].children.some(c => c.studentId === t.studentId);
      if (!childExists) {
        map[key].children.push({
          studentId: t.studentId,
          studentName: t.studentName || "",
          className: t.className || "",
          classId: t.classId,
        });
      }
      // Collect unique class names
      if (t.className && !map[key].classNames.includes(t.className)) {
        map[key].classNames.push(t.className);
      }
    }
    return Object.values(map);
  },
  get_parent_messages_history: (data) => {
    // Axios interceptor unwraps response.data, so data = { success, messages, conversation, pagination }
    // BE chat.service returns: { success: true, conversation, messages: [...], pagination }
    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id || "";
    const messages = Array.isArray(data) ? data : (data?.data?.messages || data?.messages || []);
    return messages.map((m) => ({
      id: m.id,
      from: m.user_id === currentUserId ? "me" : "other",
      text: m.content,
      senderName: m.sender_name || (m.user_id === currentUserId ? "Tôi" : "Giáo viên"),
      createdAt: m.created_at,
    }));
  },
  get_parent_notifications: (data) => {
    const notifs = Array.isArray(data) ? data : (data?.data || []);
    return notifs.map(mapNotification);
  },
  get_parent_child_grades: (data) => {
    // BE returns { success: true, data: [...] } - extract array
    const arr = Array.isArray(data) ? data : (data?.data || []);
    if (!arr || !Array.isArray(arr)) return { hk1: [], hk2: [], year: [] };

    // Group raw records by grade_item_name (subject fallback)
    const bySubject = {};
    for (const record of data) {
      // Dùng grade_item_name làm subject nếu không có subject_name riêng
      const sub = record.subject_name || record.grade_item_name || "Chưa phân loại";
      if (!bySubject[sub]) {
        bySubject[sub] = { items: [] };
      }
      bySubject[sub].items.push({
        name: record.grade_item_name,
        score: parseFloat(record.score) || 0,
        semesterId: record.semester_id,
        semesterName: record.semester_name,
      });
    }

    const getSemesterNum = (record) => {
      if (record.semester_id) {
        const sid = String(record.semester_id);
        if (sid === "1" || sid.includes("HK1") || sid.includes("1")) return 1;
        if (sid === "2" || sid.includes("HK2") || sid.includes("2")) return 2;
      }
      const name = (record.semesterName || record.name || "").toUpperCase();
      if (name.includes("HK1") || name.includes("1")) return 1;
      if (name.includes("HK2") || name.includes("2")) return 2;
      return 0;
    };

    const buildSubjects = (semester) => {
      return Object.entries(bySubject)
        .map(([subject, { items }]) => {
          const filteredItems = semester === 0
            ? items
            : items.filter(i => getSemesterNum(i) === semester);

          const oral = filteredItems.filter(i => /miệng|oral/i.test(i.name));
          const test15 = filteredItems.filter(i => /15|15['\s]?phút/i.test(i.name));
          const midterm = filteredItems.filter(i => /giữa kỳ|midterm|thi/i.test(i.name));
          const final = filteredItems.filter(i => /cuối kỳ|final/i.test(i.name));
          const avg = (arr) => arr.length ? arr.reduce((s, x) => s + x.score, 0) / arr.length : null;
          const calcAvg = avg([...oral, ...test15, ...midterm, ...final]);

          return {
            subject,
            oral: avg(oral) ? parseFloat(avg(oral).toFixed(2)) : null,
            test15: avg(test15) ? parseFloat(avg(test15).toFixed(2)) : null,
            midterm: avg(midterm) ? parseFloat(avg(midterm).toFixed(2)) : null,
            final: avg(final) ? parseFloat(avg(final).toFixed(2)) : null,
            average: calcAvg ? parseFloat(calcAvg.toFixed(2)) : null,
          };
        })
        .filter(s => s.average !== null || semester === 0);
    };

    return {
      hk1: buildSubjects(1),
      hk2: buildSubjects(2),
      year: buildSubjects(0),
    };
  },
  get_parent_child_attendance: (data) => {
    const arr = Array.isArray(data) ? data : (data?.data || []);
    if (!arr || !Array.isArray(arr)) return { weekly: [], monthly: [], records: [] };
    return { records: arr, weekly: arr, monthly: arr };
  },
  get_parent_child_schedule: (data) => {
    const arr = Array.isArray(data) ? data : (data?.data || []);
    return arr;
  },
  get_parent_payments: (data) => {
    // BE returns { success: true, data: { invoices: [...], summary: {...} } }
    const inner = Array.isArray(data) ? data : (data?.data || data || {});
    const invoices = Array.isArray(inner.invoices) ? inner.invoices : (Array.isArray(inner) ? inner : []);
    return { invoices, summary: inner.summary || {} };
  },
  get_parent_payments_by_id: (data) => {
    // BE returns single invoice
    const item = Array.isArray(data) ? data[0] : (data?.data || data || {});
    return item;
  },
};

const createEndpointCaller = (endpoint) => async (input = {}) => {
  const shouldMock = input.mock !== false;
  if (shouldMock) {
    await wait(input.delayMs ?? DEFAULT_DELAY_MS);
    // Try endpoint-specific mock first, then global mock variables
    let mockData = null;
    if (typeof endpoint.mock === "function") {
      mockData = endpoint.mock(input);
    } else if (endpoint.mock) {
      mockData = endpoint.mock;
    }
    const response = createMockResponse(endpoint, input, mockData);
    // Apply mapper for mock data too
    const mapper = ENDPOINT_MAPPERS[endpoint.key];
    if (mapper && response.data !== undefined) {
      response.data = mapper(response.data);
    }
    return response;
  }

  const response = await axiosClient(
    buildRequestConfig({
      endpoint,
      params: input.params,
      body: input.body,
      pathParams: input.pathParams,
      config: input.config,
    }),
  );

  // Apply mapper if available
  const mapper = ENDPOINT_MAPPERS[endpoint.key];
  if (mapper && response?.data !== undefined) {
    response.data = mapper(response.data);
  }

  return response;
};

const endpointCallers = Object.fromEntries(PARENT_ENDPOINTS.map((endpoint) => [endpoint.key, createEndpointCaller(endpoint)]));
const modules = PARENT_ENDPOINTS.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) acc[endpoint.module] = [];
  acc[endpoint.module].push(endpoint);
  return acc;
}, {});
const moduleServices = PARENT_ENDPOINTS.reduce((acc, endpoint) => {
  if (!acc[endpoint.module]) acc[endpoint.module] = {};
  acc[endpoint.module][endpoint.key] = endpointCallers[endpoint.key];
  return acc;
}, {});

const callByKey = async (key, input = {}) => {
  const endpoint = PARENT_ENDPOINTS.find((item) => item.key === key);
  if (!endpoint) throw new Error(`Unknown parent endpoint key: ${key}`);
  return createEndpointCaller(endpoint)(input);
};

const listByModule = (moduleName) => PARENT_ENDPOINTS.filter((item) => item.module === moduleName);

export const parentService = {
  endpoints: PARENT_ENDPOINTS,
  modules,
  moduleServices,
  callByKey,
  listByModule,
  getDashboard: (input) => endpointCallers.get_parent_dashboard(input),
  listChildren: (input) => endpointCallers.get_parent_children(input),
  getChildById: (input) => endpointCallers.get_parent_child_by_id(input),
  getChildGrades: (input) => endpointCallers.get_parent_child_grades(input),
  getChildAttendance: (input) => endpointCallers.get_parent_child_attendance(input),
  getChildSchedule: (input) => endpointCallers.get_parent_child_schedule(input),
  listMessages: (input) => endpointCallers.get_parent_messages(input),
  sendMessage: (input) => endpointCallers.post_parent_messages(input),
  getTeachers: (input) => endpointCallers.get_parent_teachers(input),
  getMessagesHistory: (input) => endpointCallers.get_parent_messages_history(input),
  listNotifications: (input) => endpointCallers.get_parent_notifications(input),
  markAllNotificationsRead: (input) => endpointCallers.patch_parent_notifications_mark_all_read(input),
  markNotificationRead: (input) => endpointCallers.patch_parent_notifications_by_id_read(input),
  toggleNotificationImportant: (input) => endpointCallers.patch_parent_notifications_by_id_toggle(input),
  listPayments: (input) => endpointCallers.get_parent_payments(input),
  getPaymentById: (input) => endpointCallers.get_parent_payments_by_id(input),
  payInvoice: (input) => endpointCallers.post_parent_payments_by_id_pay(input),
  applyDiscountCode: (input) => endpointCallers.post_parent_payments_apply_discount(input),
  listFaqs: (input) => endpointCallers.get_parent_faqs(input),
  listLeaveRequests: (input) => endpointCallers.get_parent_leave_requests(input),
  createLeaveRequest: (input) => endpointCallers.post_parent_leave_requests(input),
};

export default parentService;


