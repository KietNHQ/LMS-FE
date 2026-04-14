import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input, Modal, Select } from "../../../../../components/ui";
import { FiPlus, FiCalendar, FiUsers, FiClock } from "react-icons/fi";
import "./HomeroomActionDialog.css";

const officerRoleOptions = [
  "Lớp trưởng",
  "Lớp phó học tập",
  "Bí thư chi đoàn",
  "Lớp phó nề nếp",
  "Lớp phó văn thể",
  "Cán sự bộ môn",
];

const activityTypeOptions = [
  { value: "meeting", label: "Họp phụ huynh" },
  { value: "class", label: "Sinh hoạt lớp" },
  { value: "event", label: "Sự kiện / Thi đua" },
];

const locationOptions = [
  "Phòng học lớp 10A1",
  "Phòng học lớp 10A2",
  "Phòng học lớp 11B1",
  "Phòng học lớp 12A1",
  "Hội trường",
  "Sân vận động trường",
];

const initialOfficerForm = {
  name: "",
  role: officerRoleOptions[0],
  note: "",
};

const initialActivityForm = {
  title: "",
  type: "meeting",
  schedule: "",
  hour: "",
  location: "",
  note: "",
};

export default function HomeroomActionDialog({ open, mode, onClose, onSubmit }) {
  const initialForm = useMemo(
    () => (mode === "activity" ? initialActivityForm : initialOfficerForm),
    [mode]
  );

  const [form, setForm] = useState(initialForm);
  const [isTimeConfirmed, setIsTimeConfirmed] = useState(false);
  const scheduleInputRef = useRef(null);
  const hourInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setIsTimeConfirmed(false);
    }
  }, [open, initialForm]);

  if (!open) return null;

  const isActivity = mode === "activity";

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "schedule" || key === "hour") {
      setIsTimeConfirmed(false);
    }
  };

  const openNativePicker = (inputRef) => {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const formatDateLabel = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
  };

  const getTimePreview = () => {
    if (!form.hour || !form.schedule) return "Chưa chọn lịch giờ";
    return `${form.hour} ${formatDateLabel(form.schedule)}`.trim();
  };

  const handleConfirmTime = () => {
    if (!form.schedule.trim() || !form.hour.trim()) {
      alert("Vui lòng chọn đủ lịch và giờ trước khi xác nhận.");
      return;
    }
    setIsTimeConfirmed(true);
  };

  const handleSubmit = () => {
    if (isActivity) {
      if (!form.title.trim() || !form.schedule.trim() || !form.hour.trim() || !form.location.trim()) {
        alert("Vui lòng nhập đầy đủ tên hoạt động, lịch, giờ và địa điểm.");
        return;
      }
      if (!isTimeConfirmed) {
        alert("Vui lòng xác nhận lịch giờ trước khi lưu.");
        return;
      }
      onSubmit?.({
        title: form.title.trim(),
        type: form.type,
        time: `${form.hour.trim()} ${formatDateLabel(form.schedule.trim())}`.trim(),
        location: form.location.trim(),
        note: form.note.trim(),
      });
      return;
    }

    if (!form.name.trim()) {
      alert("Vui lòng nhập họ tên ban cán sự.");
      return;
    }

    onSubmit?.({
      name: form.name.trim(),
      role: form.role,
      note: form.note.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isActivity ? "Tạo hoạt động mới" : "Thêm ban cán sự"}
      className="homeroom-action-dialog"
    >
      <div className="homeroom-action-dialog__content">
        <div className="homeroom-action-dialog__intro">
          <div className="homeroom-action-dialog__icon">
            {isActivity ? <FiCalendar /> : <FiUsers />}
          </div>
          <div>
            <h4>{isActivity ? "Kế hoạch & Hoạt động" : "Ban Cán Sự Lớp"}</h4>
            <p>
              {isActivity
                ? "Thêm một hoạt động mới cho lớp chủ nhiệm."
                : "Thêm thông tin ban cán sự để hiển thị ngay trong khối tổng quan."}
            </p>
          </div>
        </div>

        {!isActivity ? (
          <>
            <Input
              label="Họ và tên"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />

            <Select
              label="Chức vụ"
              variant="custom"
              className="homeroom-action-dialog__admin-select"
              options={officerRoleOptions}
              value={form.role}
              onChange={(event) => handleChange("role", event.target.value)}
            />

            <div className="homeroom-action-dialog__field">
              <label htmlFor="homeroom-officer-note">Ghi chú</label>
              <textarea
                id="homeroom-officer-note"
                rows="3"
                placeholder="Ví dụ: Có thể giữ liên lạc qua Zalo"
                value={form.note}
                onChange={(event) => handleChange("note", event.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <Input
              label="Tên hoạt động"
              placeholder="Ví dụ: Họp phụ huynh giữa kỳ"
              value={form.title}
              onChange={(event) => handleChange("title", event.target.value)}
            />

            <Select
              label="Loại hoạt động"
              variant="custom"
              className="homeroom-action-dialog__admin-select"
              options={activityTypeOptions}
              value={form.type}
              onChange={(event) => handleChange("type", event.target.value)}
            />

            <div className="homeroom-action-dialog__field">
              <label htmlFor="homeroom-activity-schedule">
                <span className="homeroom-action-dialog__label-with-icon">
                  <FiCalendar />
                  <span>Lịch</span>
                </span>
              </label>
              <div className="homeroom-action-dialog__picker-wrap">
                <button
                  type="button"
                  className="homeroom-action-dialog__picker-icon-btn"
                  aria-label="Chọn lịch"
                  onClick={() => openNativePicker(scheduleInputRef)}
                >
                  <FiCalendar />
                </button>
                <input
                  id="homeroom-activity-schedule"
                  ref={scheduleInputRef}
                  className="homeroom-action-dialog__picker-input"
                  type="date"
                  value={form.schedule}
                  onChange={(event) => handleChange("schedule", event.target.value)}
                />
              </div>
            </div>

            <div className="homeroom-action-dialog__field">
              <label htmlFor="homeroom-activity-hour">
                <span className="homeroom-action-dialog__label-with-icon">
                  <FiClock />
                  <span>Giờ</span>
                </span>
              </label>
              <div className="homeroom-action-dialog__picker-wrap">
                <button
                  type="button"
                  className="homeroom-action-dialog__picker-icon-btn"
                  aria-label="Chọn giờ"
                  onClick={() => openNativePicker(hourInputRef)}
                >
                  <FiClock />
                </button>
                <input
                  id="homeroom-activity-hour"
                  ref={hourInputRef}
                  className="homeroom-action-dialog__picker-input"
                  type="time"
                  value={form.hour}
                  onChange={(event) => handleChange("hour", event.target.value)}
                />
              </div>
            </div>

            <div className="homeroom-action-dialog__time-confirm-row">
              <div className="homeroom-action-dialog__time-preview">
                <span>Lịch giờ đã chọn</span>
                <strong>{getTimePreview()}</strong>
              </div>
              <button
                type="button"
                className={`homeroom-action-dialog__confirm-btn ${isTimeConfirmed ? "is-confirmed" : ""}`}
                onClick={handleConfirmTime}
              >
                {isTimeConfirmed ? "Đã xác nhận" : "Xác nhận lịch giờ"}
              </button>
            </div>

            <Select
              label="Địa điểm"
              variant="custom"
              className="homeroom-action-dialog__admin-select"
              options={locationOptions}
              placeholder="Chọn địa điểm"
              value={form.location}
              onChange={(event) => handleChange("location", event.target.value)}
            />

            <div className="homeroom-action-dialog__field">
              <label htmlFor="homeroom-activity-note">Ghi chú</label>
              <textarea
                id="homeroom-activity-note"
                rows="3"
                placeholder="Ví dụ: Chuẩn bị danh sách phụ huynh"
                value={form.note}
                onChange={(event) => handleChange("note", event.target.value)}
              />
            </div>
          </>
        )}

        <div className="homeroom-action-dialog__actions">
          <button type="button" className="homeroom-action-dialog__cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="homeroom-action-dialog__submit" onClick={handleSubmit}>
            <FiPlus />
            {isActivity ? "Tạo hoạt động" : "Thêm ban cán sự"}
          </button>
        </div>
      </div>
    </Modal>
  );
}


