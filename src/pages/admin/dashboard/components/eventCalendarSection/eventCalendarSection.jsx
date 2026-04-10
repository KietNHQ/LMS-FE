import EventCalendar from "../../../../../components/common/EventCalendar/EventCalendar";

const adminCalendarPolicy = {
  canCreate: true,
  canViewDetails: true,
  canEdit: true,
  canDelete: true,
};

const adminEventTypes = [
  { value: "blue", label: "Ngày kiểm tra", description: "Thông báo kiểm tra" },
  { value: "red", label: "Ngày lễ", description: "Thông báo lễ" },
  { value: "orange", label: "Ngày nghỉ", description: "Thông báo nghỉ" },
  { value: "teal", label: "Sự kiện lớp", description: "Sự kiện cấp lớp" },
];

const adminInitialEvents = [
  { date: 10, title: "Kế hoạch HK2", content: "Rà soát tiến độ dạy học học kỳ 2", color: "red", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
  { date: 15, title: "Mốc HK1", content: "Đối soát hồ sơ học kỳ 1", color: "blue", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
  { date: 25, title: "Thông báo nghỉ hè", content: "Cập nhật lịch nghỉ hè toàn trường", color: "orange", createdBy: "Trần Gia Bảo", createdRole: "Quản trị viên" },
];

const EventCalendarSection = () => (
  <EventCalendar
    title="Lịch Sự Kiện"
    initialDate={new Date(2026, 3, 1)}
    themeClass="theme-admin"
    userRole="admin"
    rolePolicy={adminCalendarPolicy}
    eventTypes={adminEventTypes}
    initialEvents={adminInitialEvents}
  />
);

export default EventCalendarSection;

