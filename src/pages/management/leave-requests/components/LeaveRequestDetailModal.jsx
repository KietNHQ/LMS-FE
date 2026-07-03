import React from "react";
import { FiX, FiCheck, FiClock } from "react-icons/fi";
import { StatusBadge } from "../../../../components/common";
import { formatDateTimeVi, formatDateVi } from "../../../../utils/dateUtils";
import "./LeaveRequestModal.css"; // We will put modal styles here or in ManagementLeaveRequests.css

export default function LeaveRequestDetailModal({ request, onClose, onAction, canApprove }) {
  if (!request) return null;

  return (
    <div className="mlr-modal-overlay" onClick={onClose}>
      <div className="mlr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="mlr-modal-header">
          <h3>Chi tiết Đơn xin Nghỉ phép</h3>
          <button className="mlr-modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="mlr-modal-body">
          {/* Student & Class Info */}
          <div className="mlr-detail-section">
            <h4 className="section-title">Thông tin Học sinh</h4>
            <div className="mlr-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Họ và tên:</span>
                <span className="detail-value font-semibold">{request.studentName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Mã học sinh:</span>
                <span className="detail-value font-mono">{request.studentCode}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Lớp học:</span>
                <span className="detail-value badge-class">{request.className}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Khối lớp:</span>
                <span className="detail-value">{request.gradeName}</span>
              </div>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="mlr-detail-section">
            <h4 className="section-title">Thông tin Người gửi đơn</h4>
            <div className="mlr-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Phụ huynh:</span>
                <span className="detail-value">{request.guardianName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quan hệ:</span>
                <span className="detail-value text-muted">Phụ huynh học sinh</span>
              </div>
            </div>
          </div>

          {/* Leave Period & Status */}
          <div className="mlr-detail-section">
            <h4 className="section-title">Chi tiết Ngày nghỉ</h4>
            <div className="mlr-detail-grid">
              <div className="detail-item">
                <span className="detail-label">Ngày bắt đầu:</span>
                <span className="detail-value">{formatDateVi(request.startDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày kết thúc:</span>
                <span className="detail-value">{formatDateVi(request.endDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng số ngày:</span>
                <span className="detail-value font-semibold text-primary">{request.totalDays} ngày</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạng thái đơn:</span>
                <StatusBadge status={request.status === "approved" ? "success" : request.status}>
                  {request.status === "pending" && <FiClock className="icon" style={{ marginRight: "4px" }} />}
                  {request.status === "approved" && <FiCheck className="icon" style={{ marginRight: "4px" }} />}
                  {request.status === "rejected" && <FiX className="icon" style={{ marginRight: "4px" }} />}
                  {request.statusLabel || (request.status === "pending" ? "Chờ duyệt" : request.status === "approved" ? "Đã duyệt" : "Từ chối")}
                </StatusBadge>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mlr-detail-section">
            <h4 className="section-title">Lý do xin nghỉ</h4>
            <div className="reason-content-box">
              <p className="reason-text">{request.reason || "Không cung cấp lý do."}</p>
            </div>
          </div>

          {/* Additional note from Parent */}
          {request.note && (
            <div className="mlr-detail-section">
              <h4 className="section-title">Ghi chú từ Phụ huynh</h4>
              <blockquote className="parent-note-quote">
                "{request.note}"
              </blockquote>
            </div>
          )}

          {/* Approver reviews & comments */}
          {request.reviewedByName && (
            <div className="mlr-detail-section approver-section">
              <h4 className="section-title">Thông tin Phê duyệt</h4>
              <div className="mlr-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Người xử lý:</span>
                  <span className="detail-value font-semibold">{request.reviewedByName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Thời gian duyệt:</span>
                  <span className="detail-value text-muted">{formatDateTimeVi(request.reviewedAt)}</span>
                </div>
              </div>
              {request.adminNotes && (
                <div className="admin-notes-box">
                  <span className="notes-label">Ý kiến/Ghi chú của người duyệt:</span>
                  <p className="notes-text">"{request.adminNotes}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mlr-modal-footer">
          {request.status === "pending" && canApprove ? (
            <div className="action-buttons-group">
              <button
                className="btn-modal-action btn-reject"
                onClick={() => {
                  onClose();
                  onAction(request, "rejected");
                }}
              >
                <FiX className="btn-icon" /> Từ chối
              </button>
              <button
                className="btn-modal-action btn-approve"
                onClick={() => {
                  onClose();
                  onAction(request, "approved");
                }}
              >
                <FiCheck className="btn-icon" /> Phê duyệt
              </button>
            </div>
          ) : (
            <button className="btn-modal-close-only" onClick={onClose}>
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
