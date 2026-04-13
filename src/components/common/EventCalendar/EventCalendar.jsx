import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Select from "../../ui/Select/Select";
import "./EventCalendar.css";

const DEFAULT_EVENT_TYPES = [
  { value: "blue", label: "Ngày kiểm tra", description: "Thông báo kiểm tra" },
  { value: "purple", label: "Sự kiện lớp", description: "Sự kiện cấp lớp" },
  { value: "red", label: "Ngày lễ", description: "Thông báo lễ" },
  { value: "orange", label: "Ngày nghỉ", description: "Thông báo nghỉ" },
];

const DEFAULT_POLICY = {
  canCreate: true,
  canViewDetails: true,
  canEdit: true,
  canDelete: false,
};

const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const DEFAULT_EVENTS = []; // Clear defaults to allow props the full control

const EventCalendar = ({
  title = "Lịch Sự Kiện",
  initialDate,
  initialEvents = DEFAULT_EVENTS,
  eventTypes = DEFAULT_EVENT_TYPES,
  rolePolicy = DEFAULT_POLICY,
  themeClass = "theme-admin", // Default to admin navy
  userRole = "teacher", // 'admin' or 'teacher'
  currentUser = "", // The name/ID of the current logged-in user
}) => {
  const today = initialDate || new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [events, setEvents] = useState(initialEvents);
  const [modalMode, setModalMode] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventIndex, setEventIndex] = useState(0);
  const [newEvent, setNewEvent] = useState({
    date: "",
    endDate: "",
    isMultiDay: false,
    title: "",
    content: "",
    target: "all", // New field for teacher: 'all', '10A1', etc.
    color: eventTypes[0]?.value || "blue",
  });

  // Sync events with props when they change
  useEffect(() => {
    if (initialEvents) setEvents(initialEvents);
  }, [initialEvents]);

  const canCreate = rolePolicy?.canCreate ?? true;
  const canViewDetails = rolePolicy?.canViewDetails ?? true;

  // Permission logic: Admin can modify anything. Teacher only their own.
  const isOwner = (event) => userRole === "admin" || event?.createdBy === currentUser;
  const canEdit = (event) => (rolePolicy?.canEdit ?? true) && isOwner(event);
  const canDelete = (event) => (rolePolicy?.canDelete ?? false) && isOwner(event);

  const minDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-01`;
  const maxDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(getDaysInMonth(currentDate)).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(currentDate);
  const days = [];
  const firstDay = getFirstDayOfMonth(currentDate);
  for (let i = 0; i < firstDay; i += 1) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i += 1) {
    days.push(i);
  }

  const getEventRange = (event) => {
    const startDay = Number(event.startDay ?? event.date ?? 0);
    const endDayRaw = Number(event.endDay ?? event.date ?? startDay);
    const safeStartDay = Number.isFinite(startDay) ? startDay : 0;
    const safeEndDay = Number.isFinite(endDayRaw) ? endDayRaw : safeStartDay;
    return {
      startDay: Math.min(safeStartDay, safeEndDay),
      endDay: Math.max(safeStartDay, safeEndDay),
    };
  };

  // Group events by date (supporting multiple events per day)
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const range = getEventRange(event);
      for (let d = range.startDay; d <= range.endDay; d++) {
        if (!map[d]) map[d] = [];
        map[d].push(event);
      }
    });
    return map;
  }, [events]);

  const toCurrentMonthDate = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedDay(null);
    setSelectedEvent(null);
  };

  const openCreateModalForDay = (day) => {
    if (!canCreate || !day) {
      return;
    }

    setSelectedDay(day);
    setSelectedEvent(null);
    const pickedDate = toCurrentMonthDate(day);
    setNewEvent({
      date: pickedDate,
      endDate: pickedDate,
      isMultiDay: false,
      title: "",
      content: "",
      target: "all",
      color: eventTypes[0]?.value || "blue",
    });
    setModalMode("create");
  };

  const openEventDetailModal = (day, eventItem) => {
    if (!canViewDetails) return;

    const dayEvents = eventsByDate[day] || [];
    const eventIndex = dayEvents.findIndex(e => e === eventItem);

    setSelectedDay(day);
    setSelectedEvent(eventItem);
    setEventIndex(eventIndex >= 0 ? eventIndex : 0);
    setModalMode("details");
  };

  const handleNextEvent = () => {
    const dayEvents = eventsByDate[selectedDay] || [];
    if (eventIndex < dayEvents.length - 1) {
      const nextIdx = eventIndex + 1;
      setEventIndex(nextIdx);
      setSelectedEvent(dayEvents[nextIdx]);
    }
  };

  const handlePrevEvent = () => {
    const dayEvents = eventsByDate[selectedDay] || [];
    if (eventIndex > 0) {
      const prevIdx = eventIndex - 1;
      setEventIndex(prevIdx);
      setSelectedEvent(dayEvents[prevIdx]);
    }
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const dayEvents = eventsByDate[day];
    if (dayEvents && dayEvents.length > 0) {
      // If day has events, open the first one by default when clicking the cell
      openEventDetailModal(day, dayEvents[0]);
      return;
    }

    openCreateModalForDay(day);
  };

  const handleAddEvent = () => {
    if (!canCreate || !newEvent.date || !newEvent.title) {
      return;
    }

    const startDay = Number(newEvent.date.split("-")[2]);
    const endDateValue = newEvent.isMultiDay ? (newEvent.endDate || newEvent.date) : newEvent.date;
    const endDay = Number(endDateValue.split("-")[2]);

    if (!Number.isFinite(startDay) || !Number.isFinite(endDay)) {
      return;
    }

    const normalizedStartDay = Math.min(startDay, endDay);
    const normalizedEndDay = Math.max(startDay, endDay);

    const nextEvent = {
      startDay: normalizedStartDay,
      endDay: normalizedEndDay,
      title: newEvent.title,
      content: newEvent.content,
      target: newEvent.target,
      color: newEvent.color,
    };

    setEvents((prevEvents) => {
      const filtered = prevEvents.filter((item) => {
        const range = getEventRange(item);
        return !(normalizedStartDay <= range.endDay && normalizedEndDay >= range.startDay);
      });
      return [...filtered, nextEvent];
    });

    setNewEvent({
      date: "",
      endDate: "",
      isMultiDay: false,
      title: "",
      content: "",
      target: "all",
      color: eventTypes[0]?.value || "blue",
    });
    closeModal();
  };

  const handleDeleteEvent = () => {
    if (!canDelete || !selectedDay) {
      return;
    }

    const shouldDelete = window.confirm(`Xóa sự kiện ngày ${selectedDay}/${currentDate.getMonth() + 1}?`);
    if (!shouldDelete) {
      return;
    }

    setEvents((prevEvents) => prevEvents.filter((item) => item !== selectedEvent));
    closeModal();
  };

  const isToday = (day) => (
    day
    && day === today.getDate()
    && currentDate.getMonth() === today.getMonth()
    && currentDate.getFullYear() === today.getFullYear()
  );

  return (
    <div className="event-calendar">
      <div className="event-calendar__header">
        <div className="event-calendar__title">
          <h3>{title}</h3>
        </div>
        {canCreate && (
          <button
            className="event-calendar__btn-add"
            onClick={() => openCreateModalForDay(today.getDate())}
            title="Tạo sự kiện mới"
          >
            <FiPlus size={20} />
          </button>
        )}
      </div>

      <div className="event-calendar__nav">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="event-calendar__btn-nav">
          <FiChevronLeft size={18} />
        </button>
        <span className="event-calendar__month-year">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="event-calendar__btn-nav">
          <FiChevronRight size={18} />
        </button>
      </div>

      <div className="event-calendar__weekdays">
        {dayNames.map((day) => (
          <div key={day} className="event-calendar__weekday">{day}</div>
        ))}
      </div>

      <div className="event-calendar__grid">
        {days.map((day, index) => (
          <div
            key={`${day || "empty"}-${index}`}
            className={`event-calendar__day ${!day ? "event-calendar__day--empty" : ""} ${isToday(day) ? "event-calendar__day--today" : ""} ${eventsByDate[day] ? "event-calendar__day--has-event" : ""}`}
            onClick={() => handleDayClick(day)}
          >
            {day && (
              <>
                <div className="event-calendar__day-number">{day}</div>
                {eventsByDate[day] && (
                  <div className="event-calendar__events-dots">
                    {eventsByDate[day].map((event, idx) => (
                      <div
                        key={`${day}-${idx}`}
                        className={`event-calendar__dot event-calendar__event--${event.color}`}
                        title={event.title}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the day click
                          openEventDetailModal(day, event);
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="event-calendar__legend">
        {eventTypes.map((type) => (
          <div key={type.value} className="event-calendar__legend-item">
            <span className={`event-calendar__legend-color event-calendar__event--${type.value}`}></span>
            <span>{type.label}</span>
          </div>
        ))}
      </div>

      {modalMode && createPortal(
        <div className={themeClass}>
          <div className="event-calendar__modal-overlay" onClick={closeModal}>
            <div className="event-calendar__modal" onClick={(e) => e.stopPropagation()}>
              {/* Modal content ... */}
              {modalMode === "create" ? (
                <>
                  <h3>Tạo Sự Kiện Mới</h3>
                  <div className="event-calendar__modal-group">
                    <label>Ngày:</label>
                    <input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="event-calendar__date-input"
                    />
                  </div>
                  <div className="event-calendar__modal-group event-calendar__modal-group--inline">
                    <label className="event-calendar__checkbox-label">
                      <input
                        type="checkbox"
                        checked={newEvent.isMultiDay}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setNewEvent((prev) => ({
                            ...prev,
                            isMultiDay: checked,
                            endDate: checked ? (prev.endDate || prev.date) : prev.date,
                          }));
                        }}
                      />
                      Chọn nhiều ngày
                    </label>
                  </div>
                  {newEvent.isMultiDay && (
                    <div className="event-calendar__modal-group">
                      <label>Đến ngày:</label>
                      <input
                        type="date"
                        min={newEvent.date || minDate}
                        max={maxDate}
                        value={newEvent.endDate || newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        className="event-calendar__date-input"
                      />
                    </div>
                  )}
                  <div className="event-calendar__modal-group">
                    <label>Loại sự kiện:</label>
                    <Select
                      value={newEvent.color}
                      onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                      options={eventTypes.map((type) => ({
                        value: type.value,
                        label: type.label,
                        color: type.value, // Pass color for the UI hint
                      }))}
                      variant="custom"
                      placeholder="Chọn loại sự kiện"
                    />
                  </div>
                  <div className="event-calendar__modal-group">
                    <label>Tiêu đề sự kiện:</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Nhập tên sự kiện"
                    />
                  </div>
                  <div className="event-calendar__modal-group">
                    <label>Đối tượng:</label>
                    <Select
                      value={newEvent.target}
                      onChange={(e) => setNewEvent({ ...newEvent, target: e.target.value })}
                      options={[
                        { value: "all", label: "Tất cả lớp giảng dạy" },
                        { value: "homeroom", label: "Lớp chủ nhiệm" },
                        { value: "10A1", label: "Lớp 10A1" },
                        { value: "11B2", label: "Lớp 11B2" },
                      ]}
                      variant="custom"
                    />
                  </div>
                  <div className="event-calendar__modal-group">
                    <label>Nội dung chi tiết:</label>
                    <textarea
                      value={newEvent.content}
                      onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                      placeholder="Nhập nội dung chi tiết"
                      rows={3}
                    />
                  </div>
                  <div className="event-calendar__modal-actions">
                    <button className="event-calendar__modal-btn event-calendar__modal-btn--cancel" onClick={closeModal}>
                      Hủy
                    </button>
                    <button className="event-calendar__modal-btn event-calendar__modal-btn--save" onClick={handleAddEvent}>
                      Tạo Sự Kiện
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="event-calendar__modal-header">
                    <h3>Chi Tiết Sự Kiện</h3>
                    {eventsByDate[selectedDay]?.length > 1 && (
                      <div className="event-calendar__modal-nav">
                        <button
                          className="event-calendar__nav-btn"
                          onClick={handlePrevEvent}
                          disabled={eventIndex === 0}
                        >
                          <FiChevronLeft />
                        </button>
                        <span className="event-calendar__nav-counter">
                          {eventIndex + 1} / {eventsByDate[selectedDay].length}
                        </span>
                        <button
                          className="event-calendar__nav-btn"
                          onClick={handleNextEvent}
                          disabled={eventIndex === eventsByDate[selectedDay].length - 1}
                        >
                          <FiChevronRight />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="event-calendar__detail-row">
                    <span className="event-calendar__detail-label">Ngày</span>
                    <span className="event-calendar__detail-value">
                      {(() => {
                        const range = getEventRange(selectedEvent || {});
                        if (range.startDay !== range.endDay) {
                          return `${range.startDay} - ${range.endDay}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
                        }
                        return `${range.startDay}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
                      })()}
                    </span>
                  </div>
                  <div className="event-calendar__detail-row">
                    <span className="event-calendar__detail-label">Loại</span>
                    <span className="event-calendar__detail-value event-calendar__detail-value--type">
                      <span className={`event-calendar__type-dot event-calendar__event--${selectedEvent?.color || "blue"}`}></span>
                      {eventTypes.find((item) => item.value === selectedEvent?.color)?.label || "Sự kiện"}
                    </span>
                  </div>
                  <div className="event-calendar__detail-row">
                    <span className="event-calendar__detail-label">Tiêu đề</span>
                    <span className="event-calendar__detail-value">{selectedEvent?.title}</span>
                  </div>
                  <div className="event-calendar__detail-row">
                    <span className="event-calendar__detail-label">Nội dung</span>
                    <span className="event-calendar__detail-value">{selectedEvent?.content || "Không có nội dung"}</span>
                  </div>
                  {selectedEvent?.createdBy && (
                    <div className="event-calendar__detail-row">
                      <span className="event-calendar__detail-label">Người tạo</span>
                      <span className="event-calendar__detail-value">{selectedEvent.createdBy}</span>
                    </div>
                  )}
                  {selectedEvent?.createdRole && (
                    <div className="event-calendar__detail-row">
                      <span className="event-calendar__detail-label">Vai trò</span>
                      <span className="event-calendar__detail-value">{selectedEvent.createdRole}</span>
                    </div>
                  )}
                  <div className="event-calendar__modal-actions">
                    <button className="event-calendar__modal-btn event-calendar__modal-btn--cancel" onClick={closeModal}>
                      Đóng
                    </button>
                    {canDelete(selectedEvent) && (
                      <button
                        className="event-calendar__modal-btn event-calendar__modal-btn--danger"
                        onClick={handleDeleteEvent}
                      >
                        Xóa
                      </button>
                    )}
                    {canEdit(selectedEvent) && canCreate && (
                      <button
                        className="event-calendar__modal-btn event-calendar__modal-btn--save"
                        onClick={() => {
                          const range = getEventRange(selectedEvent || {});
                          setNewEvent({
                            date: toCurrentMonthDate(range.startDay || selectedDay || today.getDate()),
                            endDate: toCurrentMonthDate(range.endDay || selectedDay || today.getDate()),
                            isMultiDay: range.startDay !== range.endDay,
                            title: selectedEvent?.title || "",
                            content: selectedEvent?.content || "",
                            color: selectedEvent?.color || eventTypes[0]?.value || "blue",
                          });
                          setModalMode("create");
                        }}
                      >
                        Chỉnh Sửa
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EventCalendar;

