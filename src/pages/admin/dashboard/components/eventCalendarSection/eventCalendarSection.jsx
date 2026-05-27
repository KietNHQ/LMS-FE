import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus } from "react-icons/fi";
import EventCalendar from "../../../../../components/common/EventCalendar/EventCalendar";
import { CALENDAR_EVENT_TYPES } from "../../../../../components/common/EventCalendar/eventData";
import schoolEventsService from "../../../../../services/pages/management/calendar/schoolEventsService";
import { useSchoolYearTerm } from "../../../../../hooks/useSchoolYearTerm";

const adminCalendarPolicy = {
  canCreate: true,
  canViewDetails: true,
  canEdit: true,
  canDelete: true,
};

// Map backend event_type to calendar color
const EVENT_TYPE_TO_COLOR = {
  holiday: "orange",
  meeting: "teal",
  ceremony: "red",
  exam: "blue",
  other: "blue",
};

const CALENDAR_COLOR_TO_EVENT_TYPE = {
  blue: "exam",
  red: "ceremony",
  orange: "holiday",
  teal: "meeting",
};

// Convert API event to calendar event format
const apiEventToCalendarEvent = (apiEvent) => {
  const dateParts = apiEvent.date?.split("-") || [];
  const startDay = dateParts[2] ? parseInt(dateParts[2], 10) : 1;
  
  let endDay = startDay;
  if (apiEvent.end_date) {
    const endParts = apiEvent.end_date.split("-");
    endDay = endParts[2] ? parseInt(endParts[2], 10) : startDay;
  }

  return {
    id: apiEvent.id,
    startDay,
    endDay,
    title: apiEvent.title,
    content: apiEvent.description || "",
    color: EVENT_TYPE_TO_COLOR[apiEvent.event_type] || apiEvent.color || "blue",
    createdBy: apiEvent.created_by_name || apiEvent.createdBy || "",
    createdRole: "Quản trị viên",
    // Keep raw data for updates
    _raw: apiEvent,
  };
};

// Convert calendar event to API format
const calendarEventToApiData = (calendarEvent, semesterId, schoolYearId) => {
  const dateParts = calendarEvent.date.split("-");
  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  const endDateParts = calendarEvent.endDate?.split("-") || calendarEvent.date.split("-");
  const endYear = endDateParts[0];
  const endMonth = endDateParts[1];
  const endDay = endDateParts[2];

  return {
    title: calendarEvent.title,
    description: calendarEvent.content || "",
    date: `${year}-${month}-${day}`,
    end_date: calendarEvent.endDate ? `${endYear}-${endMonth}-${endDay}` : null,
    event_type: CALENDAR_COLOR_TO_EVENT_TYPE[calendarEvent.color] || "other",
    color: calendarEvent.color || "blue",
    semester_id: semesterId,
    school_year_id: schoolYearId,
  };
};

const EventCalendarSection = () => {
  const queryClient = useQueryClient();
  const { selectedSchoolYear, selectedTerm } = useSchoolYearTerm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    endDate: "",
    eventType: "other",
    color: "blue",
    content: "",
  });

  // Resolve semester ID from term
  const semesterId = useMemo(() => {
    if (selectedTerm === "hk1" || selectedTerm === 1 || selectedTerm === "Học kỳ 1") return 1;
    if (selectedTerm === "hk2" || selectedTerm === 2 || selectedTerm === "Học kỳ 2") return 2;
    return 1;
  }, [selectedTerm]);

  // Resolve school year ID (parse from "2025-2026" format)
  const schoolYearId = useMemo(() => {
    // Extract start year and convert to ID - assume sequential IDs
    const startYear = parseInt(selectedSchoolYear?.split("-")[0], 10);
    if (startYear === 2025) return 1;
    if (startYear === 2026) return 2;
    return 1;
  }, [selectedSchoolYear]);

  // Fetch events from API
  const {
    data: apiEvents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["school-events", semesterId, schoolYearId],
    queryFn: () => schoolEventsService.list({ semesterId, schoolYearId }),
    staleTime: 5 * 60 * 1000,
  });

  // Transform API events to calendar format
  const calendarEvents = useMemo(() => {
    return apiEvents.map(apiEventToCalendarEvent);
  }, [apiEvents]);

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: (data) => schoolEventsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-events"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      console.error("Failed to create event:", err);
      alert("Không thể tạo sự kiện. Vui lòng thử lại.");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      endDate: "",
      eventType: "other",
      color: "blue",
      content: "",
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-update color when event type changes
      if (field === "eventType") {
        updated.color = EVENT_TYPE_TO_COLOR[value] || "blue";
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert("Vui lòng nhập tiêu đề và ngày sự kiện.");
      return;
    }

    const apiData = {
      title: formData.title,
      description: formData.content,
      date: formData.date,
      end_date: formData.endDate || null,
      event_type: formData.eventType,
      color: formData.color,
      semester_id: semesterId,
      school_year_id: schoolYearId,
    };

    createMutation.mutate(apiData);
  };

  return (
    <div className="event-calendar-wrapper">
      <EventCalendar
        title="Lịch Sự Kiện"
        initialDate={new Date()}
        themeClass="theme-admin"
        userRole="admin"
        isCompact={true}
        rolePolicy={adminCalendarPolicy}
        eventTypes={CALENDAR_EVENT_TYPES}
        initialEvents={calendarEvents}
        selectedSchoolYear={selectedSchoolYear}
        selectedTerm={selectedTerm}
        showTargetSelector={false}
        onAddEvent={handleOpenModal}
      />

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="event-calendar__modal-overlay" onClick={handleCloseModal}>
          <div className="event-calendar__modal" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo Sự Kiện Mới</h3>
            
            {isLoading && <p style={{ textAlign: "center", padding: "20px" }}>Đang tải...</p>}
            {error && (
              <p style={{ textAlign: "center", padding: "20px", color: "#ef4444" }}>
                Không thể tải dữ liệu. Sẽ sử dụng danh sách trống.
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="event-calendar__modal-group">
                <label>Tiêu đề sự kiện:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="Nhập tên sự kiện"
                  required
                />
              </div>

              <div className="event-calendar__modal-group">
                <label>Ngày:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="event-calendar__date-input"
                  required
                />
              </div>

              <div className="event-calendar__modal-group">
                <label>Loại sự kiện:</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleFormChange("eventType", e.target.value)}
                  className="event-calendar__date-select"
                >
                  <option value="holiday">Ngày nghỉ lễ</option>
                  <option value="meeting">Họp</option>
                  <option value="ceremony">Lễ</option>
                  <option value="exam">Ngày thi</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="event-calendar__modal-group">
                <label>Nội dung chi tiết:</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                  placeholder="Nhập nội dung chi tiết (tùy chọn)"
                  rows={3}
                />
              </div>

              <div className="event-calendar__modal-actions">
                <button
                  type="button"
                  className="event-calendar__modal-btn event-calendar__modal-btn--cancel"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="event-calendar__modal-btn event-calendar__modal-btn--save"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Đang tạo..." : "Tạo Sự Kiện"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendarSection;
