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
];

const adminInitialEvents = [
  { date: 10, title: "Kế hoạch HK2", content: "Rà soát tiến độ dạy học học kỳ 2", color: "red" },
  { date: 15, title: "Mốc HK1", content: "Đối soát hồ sơ học kỳ 1", color: "blue" },
  { date: 25, title: "Thông báo nghỉ hè", content: "Cập nhật lịch nghỉ hè toàn trường", color: "orange" },
];

const EventCalendarSection = () => (
  <EventCalendar
    title="Lịch Sự Kiện"
    initialDate={new Date(2026, 3, 1)}
    rolePolicy={adminCalendarPolicy}
    eventTypes={adminEventTypes}
    initialEvents={adminInitialEvents}
  />
);

export default EventCalendarSection;

