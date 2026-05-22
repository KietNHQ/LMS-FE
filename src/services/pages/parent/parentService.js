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

const PARENT_ENDPOINTS = [
  { key: "get_parent_dashboard", method: "GET", path: "/guardians/me/children", module: "dashboard", mock: () => PARENT_DASHBOARD_MOCK },
  { key: "get_parent_children", method: "GET", path: "/guardians/me/children", module: "children", mock: () => PARENT_CHILDREN_MOCK },
  { key: "get_parent_child_by_id", method: "GET", path: "/guardians/me/children/:childId", module: "children", mock: (input) => PARENT_CHILDREN_MOCK.find((item) => `${item.id}` === `${input.pathParams?.childId}`) || null },
  { key: "get_parent_child_grades", method: "GET", path: "/students/:childId/grades", module: "children", mock: () => ({ semester1: [], semester2: [], year: [] }) },
  { key: "get_parent_child_attendance", method: "GET", path: "/guardians/me/children/:childId/attendance", module: "children", mock: () => ({ weekly: [], monthly: [] }) },
  { key: "get_parent_child_schedule", method: "GET", path: "/guardians/me/children/:childId/schedule", module: "children", mock: () => [] },
  { key: "get_parent_messages", method: "GET", path: "/guardians/me/messages", module: "messages", mock: () => PARENT_MESSAGES_MOCK },
  { key: "post_parent_messages", method: "POST", path: "/guardians/me/messages", module: "messages", mock: (input) => ({ id: Date.now(), ...(input.body || {}), createdAt: new Date().toISOString() }) },
  { key: "get_parent_notifications", method: "GET", path: "/guardians/me/notifications", module: "notifications", mock: () => PARENT_NOTIFICATIONS_MOCK },
  { key: "patch_parent_notifications_mark_all_read", method: "PATCH", path: "/guardians/me/notifications/mark-all-read", module: "notifications", mock: () => ({ updated: true }) },
  { key: "patch_parent_notifications_by_id_read", method: "PATCH", path: "/guardians/me/notifications/:id/read", module: "notifications", mock: (input) => ({ id: input.pathParams?.id, unread: false }) },
  { key: "patch_parent_notifications_by_id_toggle", method: "PATCH", path: "/guardians/me/notifications/:id/toggle-important", module: "notifications", mock: (input) => ({ id: input.pathParams?.id, important: true }) },
  { key: "get_parent_payments", method: "GET", path: "/guardians/me/payments", module: "payments", mock: () => PARENT_PAYMENTS_MOCK },
  { key: "get_parent_payments_by_id", method: "GET", path: "/guardians/me/payments/:id", module: "payments", mock: (input) => PARENT_PAYMENTS_MOCK.find((item) => `${item.id}` === `${input.pathParams?.id}`) || null },
  { key: "post_parent_payments_by_id_pay", method: "POST", path: "/guardians/me/payments/:id/pay", module: "payments", mock: (input) => ({ id: input.pathParams?.id, status: "paid", paidAt: new Date().toISOString() }) },
  { key: "post_parent_payments_apply_discount", method: "POST", path: "/guardians/me/payments/apply-discount", module: "payments", mock: (input) => ({ applied: true, code: input.body?.code || "" }) },
  { key: "get_parent_faqs", method: "GET", path: "/guardians/me/support/faqs", module: "support", mock: () => PARENT_FAQS_MOCK },
  { key: "post_parent_support_tickets", method: "POST", path: "/guardians/me/support/tickets", module: "support", mock: (input) => ({ id: Date.now(), ...(input.body || {}), status: "open" }) },
  { key: "get_parent_support_tickets", method: "GET", path: "/guardians/me/support/tickets", module: "support", mock: () => [] },
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
  listNotifications: (input) => endpointCallers.get_parent_notifications(input),
  markAllNotificationsRead: (input) => endpointCallers.patch_parent_notifications_mark_all_read(input),
  markNotificationRead: (input) => endpointCallers.patch_parent_notifications_by_id_read(input),
  toggleNotificationImportant: (input) => endpointCallers.patch_parent_notifications_by_id_toggle(input),
  listPayments: (input) => endpointCallers.get_parent_payments(input),
  getPaymentById: (input) => endpointCallers.get_parent_payments_by_id(input),
  payInvoice: (input) => endpointCallers.post_parent_payments_by_id_pay(input),
  applyDiscountCode: (input) => endpointCallers.post_parent_payments_apply_discount(input),
  listFaqs: (input) => endpointCallers.get_parent_faqs(input),
  listSupportTickets: (input) => endpointCallers.get_parent_support_tickets(input),
  submitSupportTicket: (input) => endpointCallers.post_parent_support_tickets(input),
};

export default parentService;


