import { useMemo, useState } from "react";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Select from "../../ui/Select/Select";
import "./EventCalendar.css";

const DEFAULT_EVENT_TYPES = [
  { value: "blue", label: "Ngày kiểm tra", description: "Thông báo kiểm tra" },
  { value: "red", label: "Ngày lễ", description: "Thông báo lễ" },
  { value: "orange", label: "Ngày nghỉ", description: "Thông báo nghỉ" },
];

const DEFAULT_EVENTS = [
  { startDay: 10, endDay: 10, title: "Kiểm tra định kỳ", content: "Kiểm tra 1 tiết", color: "blue" },
  { startDay: 15, endDay: 15, title: "Lễ trường", content: "Sinh hoạt chào mừng", color: "red" },
  { startDay: 25, endDay: 25, title: "Nghỉ", content: "Thông báo nghỉ", color: "orange" },
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

const EventCalendar = ({
  title = "Lịch Sự Kiện",
  initialDate,
  initialEvents = DEFAULT_EVENTS,
  eventTypes = DEFAULT_EVENT_TYPES,
  rolePolicy = DEFAULT_POLICY,
}) => {
  const today = initialDate || new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [events, setEvents] = useState(initialEvents);
  const [modalMode, setModalMode] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    date: "",
    endDate: "",
    isMultiDay: false,
    title: "",
    content: "",
    color: eventTypes[0]?.value || "blue",
  });

  const canCreate = rolePolicy?.canCreate ?? true;
  const canViewDetails = rolePolicy?.canViewDetails ?? true;
  const canEdit = rolePolicy?.canEdit ?? true;
  const canDelete = rolePolicy?.canDelete ?? false;

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

  const eventsByDate = useMemo(() => {
    const dayMap = {};

    events.forEach((event) => {
      const { startDay, endDay } = getEventRange(event);
      for (let day = startDay; day <= endDay; day += 1) {
        dayMap[day] = event;
      }
    });

    return dayMap;
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
      color: eventTypes[0]?.value || "blue",
    });
    setModalMode("create");
  };

  const openEventDetailModal = (day, eventItem) => {
    if (!canViewDetails) {
      return;
    }
    setSelectedDay(day);
    setSelectedEvent(eventItem);
    setModalMode("details");
  };

  const handleDayClick = (day) => {
    if (!day) {
      return;
    }

    const eventItem = eventsByDate[day];
    if (eventItem) {
      openEventDetailModal(day, eventItem);
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
                  <div
                    className={`event-calendar__event event-calendar__event--${eventsByDate[day].color}`}
                    title={eventsByDate[day].title}
                  >
                    {eventsByDate[day].title}
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

      {modalMode && (
        <div className="event-calendar__modal-overlay" onClick={closeModal}>
          <div className="event-calendar__modal" onClick={(e) => e.stopPropagation()}>
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
                    }))}
                    variant="custom"
                    placeholder="Chọn loại sự kiện"
                  />
                </div>
                <div className="event-calendar__modal-group">
                  <label>Tên sự kiện:</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Nhập tên sự kiện"
                  />
                </div>
                <div className="event-calendar__modal-group">
                  <label>Nội dung:</label>
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
                <h3>Chi Tiết Sự Kiện</h3>
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
                <div className="event-calendar__modal-actions">
                  <button className="event-calendar__modal-btn event-calendar__modal-btn--cancel" onClick={closeModal}>
                    Đóng
                  </button>
                  {canDelete && (
                    <button
                      className="event-calendar__modal-btn event-calendar__modal-btn--danger"
                      onClick={handleDeleteEvent}
                    >
                      Xóa
                    </button>
                  )}
                  {canEdit && canCreate && (
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
      )}
    </div>
  );
};

export default EventCalendar;

