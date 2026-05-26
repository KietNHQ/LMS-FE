import React, { useMemo, useRef, useState } from "react";
import { Input, Modal, Select } from "../../../../../components/ui";
import { FiPlus, FiCalendar, FiUsers, FiClock, FiTrash2, FiCheckCircle } from "react-icons/fi";
import "./HomeroomActionDialog.css";

const activityTypeOptions = [
  { value: "meeting", label: "Họp phụ huynh" },
  { value: "class", label: "Sinh hoạt lớp" },
  { value: "event", label: "Sự kiện / Thi đua" },
];

// Maps FE role keys to DB role values
const OFFICER_ROLE_DB_MAP = {
  monitor: "monitor",
  viceMonitor: "vice_monitor_academic",
  secretary: "secretary",
};

const locationOptions = [
  "Phòng học lớp 10A1",
  "Phòng học lớp 10A2",
  "Phòng học lớp 11B1",
  "Phòng học lớp 12A1",
  "Hội trường",
  "Sân vận động trường",
];

const initialActivityForm = {
  title: "",
  type: "meeting",
  schedule: "",
  hour: "",
  location: "",
  note: "",
};

export default function HomeroomActionDialog({ open, mode, onClose, onSubmit, students = [], officerRows = [], extraOfficers = [], editingData = null }) {
  const initialForm = useMemo(
    () => {
      if (mode === "activity") {
        if (editingData) {
          // Cố gắng parse ngày tháng từ chuỗi "HH:mm ..., DD/MM" nếu có thể
          // Nhưng tốt nhất là dùng dữ liệu gốc nếu có
          return {
            title: editingData.title || "",
            type: editingData.type || "meeting",
            schedule: editingData.schedule || "", // Giả định BE sẽ có trường này
            hour: editingData.hour || editingData.time?.split(' ')[0] || "",
            location: editingData.location || "",
            note: editingData.note || "",
          };
        }
        return initialActivityForm;
      }

      return {
        assignments: officerRows.map((role) => ({
          key: role.key,
          label: role.label,
          studentId: role.studentId || "",
        })),
        extraRoles: (extraOfficers || []).map((role, index) => ({
          id: `${role.role || "extra"}-${index}`,
          role: role.role || "",
          studentId: role.studentId || students.find((student) => student.name === role.name)?.id || "",
          note: role.note || "",
        })),
      };
    },
    [mode, officerRows, extraOfficers, students]
  );

  const [form, setForm] = useState(initialForm);
  const [isTimeConfirmed, setIsTimeConfirmed] = useState(!!editingData);
  const scheduleInputRef = useRef(null);
  const hourInputRef = useRef(null);

  if (!open) return null;

  const isActivity = mode === "activity";
  const isOfficerMode = mode === "officer";

  const selectedStudentIds = useMemo(() => {
    if (!isOfficerMode) return [];

    return [
      ...(form.assignments || []).map((item) => item.studentId).filter(Boolean),
      ...(form.extraRoles || []).map((item) => item.studentId).filter(Boolean),
    ];
  }, [form, isOfficerMode]);

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
        schedule: form.schedule.trim(),
        hour: form.hour.trim(),
        location: form.location.trim(),
        note: form.note.trim(),
      });
      return;
    }

    if (isOfficerMode) {
      const incompleteExtraRole = (form.extraRoles || []).find((item) => (item.role.trim() && !item.studentId) || (!item.role.trim() && item.studentId));
      if (incompleteExtraRole) {
        alert("Vui lòng chọn đủ tên vai trò phụ và học sinh tương ứng.");
        return;
      }

      const roleMap = new Map();
      for (const item of form.assignments || []) {
        if (!item.studentId) continue;
        const dbRole = OFFICER_ROLE_DB_MAP[item.key] ?? item.key;
        if (roleMap.has(item.studentId)) {
          const conflictingRole = roleMap.get(item.studentId);
          alert(`Học sinh đã được gán vai trò "${conflictingRole === 'monitor' ? 'Lớp trưởng' : conflictingRole === 'vice_monitor_academic' ? 'Lớp phó' : 'Bí thư'}". Mỗi học sinh chỉ được giữ 1 vai trò.`);
          return;
        }
        roleMap.set(item.studentId, dbRole);
      }

      for (const item of form.extraRoles || []) {
        if (!item.studentId) continue;
        if (roleMap.has(item.studentId)) {
          alert(`Học sinh đã được gán một vai trò khác. Mỗi học sinh chỉ được giữ 1 vai trò.`);
          return;
        }
        roleMap.set(item.studentId, item.id);
      }

      onSubmit?.({
        assignments: (form.assignments || []).map((item) => ({
          role: OFFICER_ROLE_DB_MAP[item.key] ?? item.key,
          label: item.label,
          studentId: item.studentId || "",
        })),
        extraRoles: (form.extraRoles || [])
          .filter((item) => item.role.trim() || item.studentId)
          .map((item) => ({
            id: item.id,
            role: item.role.trim(),
            studentId: item.studentId || "",
            note: item.note.trim(),
          })),
      });
      return;
    }

    alert("Thiếu dữ liệu ban cán sự.");
  };

  const updateAssignment = (index, studentId) => {
    setForm((prev) => ({
      ...prev,
      assignments: prev.assignments.map((item, itemIndex) => (itemIndex === index ? { ...item, studentId } : item)),
    }));
  };

  const addExtraRole = () => {
    setForm((prev) => ({
      ...prev,
      extraRoles: [
        ...(prev.extraRoles || []),
        { id: `extra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role: "", studentId: "", note: "" },
      ],
    }));
  };

  const updateExtraRole = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      extraRoles: prev.extraRoles.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)),
    }));
  };

  const removeExtraRole = (index) => {
    setForm((prev) => ({
      ...prev,
      extraRoles: prev.extraRoles.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isOfficerMode ? "Phân công ban cán sự" : (editingData ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới")}
      className="homeroom-action-dialog"
    >
      <div className="homeroom-action-dialog__content">

        {isOfficerMode ? (
          <>

            <div className="homeroom-action-dialog__officer-section">
              <div className="homeroom-action-dialog__section-title">Vai trò chính</div>
              <div className="homeroom-action-dialog__officer-rows">
                {(form.assignments || []).map((assignment, index) => (
                  <div key={assignment.key} className="homeroom-action-dialog__role-row">
                    <div className="role-label">{assignment.label}</div>
                    <div className="role-select">
                      <Select
                        variant="custom"
                        searchable={true}
                        placeholder="Chọn học sinh..."
                        options={students.map((s) => ({
                          value: s.id,
                          label: s.name,
                          disabled: selectedStudentIds.includes(s.id) && s.id !== assignment.studentId,
                        }))}
                        value={assignment.studentId}
                        onChange={(event) => updateAssignment(index, event.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="homeroom-action-dialog__officer-section">
              <div className="homeroom-action-dialog__section-header homeroom-action-dialog__section-header--space-between">
                <div className="homeroom-action-dialog__section-title">Vai trò phụ</div>
                <button type="button" className="homeroom-action-dialog__add-role-btn-lite" onClick={addExtraRole}>
                  <FiPlus /> Thêm vai trò
                </button>
              </div>

              <div className="homeroom-action-dialog__extra-role-list">
                {(form.extraRoles || []).length === 0 ? (
                  <div className="homeroom-action-dialog__empty-extra-role">
                    Chưa có vai trò phụ nào được thiết lập.
                  </div>
                ) : (
                  (form.extraRoles || []).map((item, index) => (
                    <div key={item.id} className="homeroom-action-dialog__role-row extra">
                      <div className="role-input">
                        <input
                          type="text"
                          placeholder="Tên vai trò (VD: Lớp phó văn thể)"
                          value={item.role}
                          onChange={(event) => updateExtraRole(index, "role", event.target.value)}
                        />
                      </div>
                      <div className="role-select">
                        <Select
                          variant="custom"
                          searchable={true}
                          menuDirection="up"
                          placeholder="Học sinh..."
                          options={students.map((s) => ({
                            value: s.id,
                            label: s.name,
                            disabled: selectedStudentIds.includes(s.id) && s.id !== item.studentId,
                          }))}
                          value={item.studentId}
                          onChange={(event) => updateExtraRole(index, "studentId", event.target.value)}
                        />
                      </div>
                      <button type="button" className="homeroom-action-dialog__remove-role-btn-lite" onClick={() => removeExtraRole(index)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : !isActivity ? (
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
          <div className="homeroom-action-dialog__form-grid">
            <div className="homeroom-action-dialog__field full-width">
              <Input
                label="Tên hoạt động"
                placeholder="Ví dụ: Họp phụ huynh giữa kỳ"
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
              />
            </div>

            <div className="homeroom-action-dialog__field">
              <Select
                label="Loại hoạt động"
                variant="custom"
                className="homeroom-action-dialog__admin-select"
                options={activityTypeOptions}
                value={form.type}
                onChange={(event) => handleChange("type", event.target.value)}
              />
            </div>

            <div className="homeroom-action-dialog__field">
              <Select
                label="Địa điểm"
                variant="custom"
                className="homeroom-action-dialog__admin-select"
                options={locationOptions}
                placeholder="Chọn địa điểm"
                value={form.location}
                onChange={(event) => handleChange("location", event.target.value)}
              />
            </div>

            <div className="homeroom-action-dialog__field">
              <label htmlFor="homeroom-activity-schedule">
                <span className="homeroom-action-dialog__label-with-icon">
                  <FiCalendar />
                  <span>Ngày tổ chức</span>
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
                  <span>Giờ bắt đầu</span>
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

            <div className="homeroom-action-dialog__field full-width">
              <div className="homeroom-action-dialog__time-confirm-row">
                <div className="homeroom-action-dialog__time-preview">
                  <span>Thời gian đã chọn:</span>
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
            </div>

            <div className="homeroom-action-dialog__field full-width">
              <label htmlFor="homeroom-activity-note">Ghi chú (không bắt buộc)</label>
              <textarea
                id="homeroom-activity-note"
                rows="3"
                placeholder="Ví dụ: Chuẩn bị danh sách phụ huynh, tài liệu họp..."
                value={form.note}
                onChange={(event) => handleChange("note", event.target.value)}
              />
            </div>
          </div>
        )}

        <div className="homeroom-action-dialog__actions">
          <button type="button" className="homeroom-action-dialog__cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="homeroom-action-dialog__submit" onClick={handleSubmit}>
            {editingData ? <FiCheckCircle /> : <FiPlus />}
            {isActivity ? (editingData ? "Cập nhật hoạt động" : "Tạo hoạt động") : "Thêm ban cán sự"}
          </button>
        </div>
      </div>
    </Modal>
  );
}



