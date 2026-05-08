export const CALENDAR_EVENT_TYPES = [
  { value: "blue", label: "Ngày kiểm tra", description: "Thông báo kiểm tra" },
  { value: "red", label: "Ngày lễ", description: "Thông báo lễ" },
  { value: "orange", label: "Ngày nghỉ", description: "Thông báo nghỉ" },
  { value: "teal", label: "Sự kiện lớp", description: "Sự kiện cấp lớp" },
];

export const INITIAL_CALENDAR_EVENTS = [
  // Admin created events (using startDay/endDay for consistency)
  { startDay: 10, endDay: 10, title: "Kế hoạch HK2", content: "Rà soát tiến độ dạy học học kỳ 2", color: "red", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
  { startDay: 15, endDay: 15, title: "Mốc HK1", content: "Đối soát hồ sơ học kỳ 1", color: "blue", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
  { startDay: 25, endDay: 25, title: "Thông báo nghỉ hè", content: "Cập nhật lịch nghỉ hè toàn trường", color: "orange", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
  
  // Teacher created events
  { startDay: 10, endDay: 10, title: "Kiểm tra Toán 15p", content: "Chương 1: Đại số", color: "blue", createdBy: "Lê Minh Hoàng", createdRole: "Giáo viên" },
  { startDay: 15, endDay: 15, title: "Họp phụ huynh", content: "Báo cáo giữa kỳ", color: "teal", createdBy: "Lê Minh Hoàng", createdRole: "Giáo viên" },
  { startDay: 15, endDay: 15, title: "Lễ kỷ niệm", content: "Sinh hoạt chung", color: "red", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
  { startDay: 25, endDay: 25, title: "Nghỉ lễ", content: "Thông báo nghỉ", color: "orange", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
];

