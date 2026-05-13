import { useMemo } from "react";
import { FiX } from "react-icons/fi";
import { Modal } from "../../../../../components/ui";
import "./HomeroomStudentDetailDialog.css";

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
  student,
  officerRows = [],
  onClose,
  onViewAttendance,
}) {
  const currentRole = useMemo(
    () => officerRows.find((role) => role.studentId === student?.id) || null,
    [officerRows, student]
  );

  return (
    <Modal open={open} title="Chi tiết học sinh" onClose={onClose} className="homeroom-student-detail-dialog">
      {!student ? null : (
        <div className="homeroom-student-detail-dialog__body">
          <div className="homeroom-student-detail-dialog__hero">
            <div className="homeroom-student-detail-dialog__avatar">
              {student.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="homeroom-student-detail-dialog__hero-info">
              <h3>{student.name}</h3>
              <p>{student.email || "—"}</p>
              <span>{student.className || "Lớp chủ nhiệm"}</span>
            </div>
          </div>

          <div className="homeroom-student-detail-dialog__info-grid">
            <div>
              <span>Tên học sinh</span>
              <strong>{student.name || "—"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{student.email || "—"}</strong>
            </div>
            <div>
              <span>Giới tính</span>
              <strong>{student.gender || "—"}</strong>
            </div>
            <div>
              <span>Ngày sinh</span>
              <strong>{formatDate(student.dob)}</strong>
            </div>
            <div>
              <span>Phụ huynh</span>
              <strong>{student.parentName || "—"}</strong>
            </div>
            <div>
              <span>SĐT phụ huynh</span>
              <strong>{student.parentPhone || "—"}</strong>
            </div>
            <div>
              <span>Vai trò</span>
              <strong>{currentRole?.label || "Chưa phân công"}</strong>
            </div>
            <div 
              className="homeroom-student-detail-dialog__clickable-stat"
              onClick={() => onViewAttendance?.(student)}
              title="Click để xem chuyên cần của học sinh này"
            >
              <span>Số lần vi phạm</span>
              <strong style={{ color: (student.violations || 0) > 0 ? "#ef4444" : "#2563ff", textDecoration: "underline" }}>
                {student.violations ?? 0} lần
              </strong>
            </div>
          </div>

          <div className="homeroom-student-detail-dialog__actions">
            <button
              type="button"
              className="homeroom-student-detail-dialog__primary-btn"
              onClick={onClose}
            >
              <FiX />
              <span>Đóng</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
