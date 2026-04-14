import EventCalendar from "../../../../../components/common/EventCalendar/EventCalendar";
import { INITIAL_CALENDAR_EVENTS, CALENDAR_EVENT_TYPES } from "../../../../../components/common/EventCalendar/eventData";

const adminCalendarPolicy = {
  canCreate: true,
  canViewDetails: true,
  canEdit: true,
  canDelete: true,
};

const EventCalendarSection = () => (
  <EventCalendar
    title="Lịch Sự Kiện"
    initialDate={new Date(2026, 3, 1)}
    themeClass="theme-admin"
    userRole="admin"
    isCompact={true}
    rolePolicy={adminCalendarPolicy}
    eventTypes={CALENDAR_EVENT_TYPES}
    initialEvents={INITIAL_CALENDAR_EVENTS}
  />
);

export default EventCalendarSection;


