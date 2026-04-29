import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiUserPlus, FiX } from "react-icons/fi";
import { Modal } from "../../../../../components/ui";
import "./HomeroomStudentDetailDialog.css";

const genderOptions = ["Nam", "Nữ"];

function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function HomeroomStudentDetailDialog({
  open,
  mode = "view",
  student,
  officerRows = [],
  onClose,
  onEdit,
  onSave,
  onAssignOfficer,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "Nam",
    dob: "",
    parentName: "",
    parentPhone: "",
  });

  useEffect(() => {
    if (!student) return;
    setForm({
      name: student.name || "",
      email: student.email || "",
      gender: student.gender || "Nam",
      dob: student.dob || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
    });
  }, [student]);

  const currentRole = useMemo(
    () => officerRows.find((role) => role.studentId === student?.id) || null,
    [officerRows, student]
  );

  const roleCards = useMemo(
    () => officerRows.map((role) => ({
      ...role,
      isCurrent: role.studentId === student?.id,
      isOccupiedByAnother: Boolean(role.studentId && role.studentId !== student?.id),
    })),
    [officerRows, student]
  );

  const firstAvailableRole = useMemo(
    () => roleCards.find((role) => !role.isOccupiedByAnother)?.key || null,
    [roleCards]
  );

  const handleSubmit = () => {
    if (!student) return;
    onSave?.(student.id, {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
    });
  };

  const handleRoleAssign = (roleKey) => {
    if (!student) return;
    onAssignOfficer?.(student.id, roleKey);
  };

  return (
    <Modal open={open} title={mode === "edit" ? "Chỉnh sửa học sinh" : "Chi tiết học sinh"} onClose={onClose} className="homeroom-student-detail-dialog">
      {!student ? null : (
        <div className="homeroom-student-detail-dialog__body">
          <div className="homeroom-student-detail-dialog__hero">
            <div className="homeroom-student-detail-dialog__avatar">{student.name?.charAt(0)?.toUpperCase()}</div>
            <div className="homeroom-student-detail-dialog__hero-info">
              <h3>{student.name}</h3>
              <p>{student.email || "—"}</p>
              <span>{student.className || "Lớp chủ nhiệm"}</span>
            </div>
          </div>

          {mode === "edit" ? (
            <div className="homeroom-student-detail-dialog__form">
              <div className="homeroom-student-detail-dialog__grid">
                <label>
                  <span>Họ và tên</span>
                  <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
                </label>
                <label>
                  <span>Email</span>
                  <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                </label>
                <label>
                  <span>Giới tính</span>
                  <select value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Ngày sinh</span>
                  <input type="date" value={form.dob} onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))} />
                </label>
                <label>
                  <span>Phụ huynh</span>
                  <input value={form.parentName} onChange={(e) => setForm((prev) => ({ ...prev, parentName: e.target.value }))} />
                </label>
                <label>
                  <span>SĐT phụ huynh</span>
                  <input value={form.parentPhone} onChange={(e) => setForm((prev) => ({ ...prev, parentPhone: e.target.value }))} />
                </label>
              </div>

              <div className="homeroom-student-detail-dialog__meta">
                <div><span>Lớp</span><strong>{student.className || "—"}</strong></div>
                <div><span>Vai trò hiện tại</span><strong>{currentRole?.label || "Chưa phân công"}</strong></div>
                <div><span>Ngày sinh hiển thị</span><strong>{formatDate(form.dob)}</strong></div>
              </div>
            </div>
          ) : (
            <div className="homeroom-student-detail-dialog__info-grid">
              <div><span>Tên học sinh</span><strong>{student.name || "—"}</strong></div>
              <div><span>Email</span><strong>{student.email || "—"}</strong></div>
              <div><span>Giới tính</span><strong>{student.gender || "—"}</strong></div>
              <div><span>Ngày sinh</span><strong>{formatDate(student.dob)}</strong></div>
              <div><span>Phụ huynh</span><strong>{student.parentName || "—"}</strong></div>
              <div><span>SĐT phụ huynh</span><strong>{student.parentPhone || "—"}</strong></div>
              <div><span>Vai trò</span><strong>{currentRole?.label || "Chưa phân công"}</strong></div>
            </div>
          )}

          <div className="homeroom-student-detail-dialog__roles">
            <div className="homeroom-student-detail-dialog__roles-header">
              <span>Phân công ban cán sự</span>
              <strong>Chỉ 1 học sinh giữ mỗi vai trò</strong>
            </div>
            <div className="homeroom-student-detail-dialog__role-list">
              {roleCards.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  className={`homeroom-student-detail-dialog__role-card ${role.isCurrent ? "active" : ""}`}
                  disabled={role.isOccupiedByAnother || mode === "edit"}
                  onClick={() => handleRoleAssign(role.key)}
                  title={role.isOccupiedByAnother ? `Đang do ${role.studentName} đảm nhiệm` : role.label}
                >
                  <span>{role.label}</span>
                  <strong>{role.studentName || "Chưa phân công"}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="homeroom-student-detail-dialog__actions">
            {mode === "edit" ? (
              <>
                <button type="button" className="homeroom-student-detail-dialog__ghost-btn" onClick={onClose}>Hủy</button>
                <button type="button" className="homeroom-student-detail-dialog__primary-btn" onClick={handleSubmit}>
                  <FiEdit2 />
                  <span>Lưu</span>
                </button>
              </>
            ) : (
              <>
                <button type="button" className="homeroom-student-detail-dialog__ghost-btn" onClick={() => onEdit?.(student)}>
                  <FiEdit2 />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  type="button"
                  className="homeroom-student-detail-dialog__primary-btn"
                  onClick={() => firstAvailableRole && handleRoleAssign(firstAvailableRole)}
                  disabled={!firstAvailableRole}
                >
                  <FiUserPlus />
                  <span>Cấp quyền</span>
                </button>
                <button type="button" className="homeroom-student-detail-dialog__ghost-btn" onClick={onClose}>
                  <FiX />
                  <span>Đóng</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}


