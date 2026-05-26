import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiX, FiShield, FiAward } from "react-icons/fi";
import { Modal } from "../../../../../components/ui";
import { vpDisciplineService } from "../../../../../services/pages/management/vp-discipline/vpDisciplineService";
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
  viewMode = "info",
  selectedWeek = 1
}) {
  const currentRole = useMemo(
    () => officerRows.find((role) => role.studentId === student?.id) || null,
    [officerRows, student]
  );

  // Fetch real violations and rewards from API
  const enrollmentId = student?.enrollmentId ?? student?.id;

  const { data: studentViolations = [] } = useQuery({
    queryKey: ["student-violations", enrollmentId],
    queryFn: () => vpDisciplineService.callByKey("get_discipline_violations_student_by_studentenrollmentid", {
      pathParams: { studentEnrollmentId: enrollmentId },
    }),
    enabled: Boolean(enrollmentId),
  });

  const { data: studentRewards = [] } = useQuery({
    queryKey: ["student-rewards", enrollmentId],
    queryFn: () => vpDisciplineService.callByKey("get_discipline_rewards_student_by_studentenrollmentid", {
      pathParams: { studentEnrollmentId: enrollmentId },
    }),
    enabled: Boolean(enrollmentId),
  });

  // Use parent-provided attendance/merit data if available, fallback to fetched counts
  const meritPoints = student.meritPoints ?? studentRewards.length ?? 0;
  const violationCount = studentViolations.length ?? student.violations ?? 0;

  return (
    <Modal 
      open={open} 
      title={viewMode === "activity" ? "Chi tiết hoạt động học sinh" : "Chi tiết học sinh"} 
      onClose={onClose} 
      className={`homeroom-student-detail-dialog ${viewMode === "activity" ? "activity-mode" : ""}`}
    >
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

          {viewMode !== "activity" && (
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
                  <strong style={{ color: violationCount > 0 ? "#ef4444" : "#2563ff", textDecoration: "underline" }}>
                    {violationCount} lần
                  </strong>
                </div>
            </div>
          )}

          {viewMode === "activity" && (
            <div className="homeroom-student-detail-activity">
              <div className="activity-summary-ribbon">
                <div className="summary-item violation">
                  <FiShield /> <span>{violationCount} vi phạm</span>
                </div>
                <div className="summary-item merit">
                  <FiAward /> <span>{meritPoints} khen thưởng</span>
                </div>
              </div>

              <h4>Chi tiết hoạt động (Tuần {selectedWeek || 1})</h4>

              <div className="activity-list">
                {violationCount === 0 && meritPoints === 0 ? (
                  <p className="no-activity">Không có ghi nhận nào trong tuần này.</p>
                ) : (
                  <>
                    {/* Render real Violations */}
                    {studentViolations.map((violation) => (
                      <div key={violation.id} className="activity-item violation">
                        <span className="activity-dot"></span>
                        <div className="activity-content">
                          <strong>Vi phạm: {violation.violationTypeName || violation.description || "—"}</strong>
                          <span className="activity-meta">
                            {formatDate(violation.occurredAt || violation.date)} • Người báo cáo: {violation.reporterName || "—"}
                          </span>
                        </div>
                        <span className="activity-tag">-{Math.abs(violation.pointDeduction ?? violation.points ?? 0)}đ</span>
                      </div>
                    ))}

                    {/* Render real Merits/Rewards */}
                    {studentRewards.map((reward) => (
                      <div key={reward.id} className="activity-item merit">
                        <span className="activity-dot"></span>
                        <div className="activity-content">
                          <strong>Khen thưởng: {reward.rewardTypeName || reward.description || "—"}</strong>
                          <span className="activity-meta">
                            {formatDate(reward.occurredAt || reward.date)} • Người báo cáo: {reward.reporterName || "—"}
                          </span>
                        </div>
                        <span className="activity-tag">+{reward.pointAddition ?? reward.points ?? 0}đ</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

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
