import React, { useState } from "react";
import { FiCheck, FiX, FiInfo } from "react-icons/fi";
import "./LeaveRequestModal.css";

export default function LeaveRequestActionModal({
  request,
  actionType,
  notes,
  onNotesChange,
  onConfirm,
  onCancel
}) {
  if (!request) return null;
  const isApprove = actionType === "approved";
  const [error, setError] = useState("");

  const handleConfirmClick = () => {
    if (!isApprove && !notes.trim()) {
      setError("Vui lòng nhập lý do từ chối đơn xin nghỉ phép.");
      return;
    }
    setError("");
    onConfirm();
  };

  return (
    <div className="mlr-modal-overlay" onClick={onCancel}>
      <div className="mlr-modal-content action-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mlr-modal-header">
          <h3>{isApprove ? "Duyệt Đơn xin Nghỉ phép" : "Từ chối Đơn xin Nghỉ phép"}</h3>
          <button className="mlr-modal-close" onClick={onCancel}>
            <FiX size={20} />
          </button>
        </div>

        <div className="mlr-modal-body">
          {/* Brief Summary of request */}
          <div className="mlr-action-summary-card">
            <div className="summary-row">
              <span className="summary-label">Học sinh:</span>
              <span className="summary-value font-semibold">{request.studentName} ({request.className})</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Nghỉ từ:</span>
              <span className="summary-value font-semibold">{request.startDate} → {request.endDate} ({request.totalDays} ngày)</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Lý do nghỉ:</span>
              <span className="summary-value text-muted italic">"{request.reason || "Không ghi rõ"}"</span>
            </div>
          </div>

          {/* Notes Input Section */}
          <div className="mlr-action-notes-section">
            <label className="input-label">
              {isApprove ? "Ghi chú phê duyệt (Tùy chọn)" : "Lý do từ chối phê duyệt"}
              {!isApprove && <span className="required-star"> *</span>}
            </label>
            <textarea
              className={`notes-textarea ${error ? "has-error" : ""}`}
              value={notes}
              onChange={(e) => {
                onNotesChange(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              placeholder={
                isApprove
                  ? "Nhập ghi chú ý kiến nếu cần (ví dụ: Đồng ý cho nghỉ, gia đình phối hợp đôn đốc học bù...)"
                  : "Nhập lý do cụ thể từ chối đơn xin nghỉ phép này (ví dụ: Trùng với ngày thi học kỳ quan trọng...)"
              }
              rows={4}
            />
            {error && <span className="error-message-text"><FiInfo size={14} /> {error}</span>}
          </div>
        </div>

        <div className="mlr-modal-footer">
          <button className="btn-action-cancel" onClick={onCancel}>
            Hủy bỏ
          </button>
          <button
            className={`btn-action-confirm ${isApprove ? "confirm-approve" : "confirm-reject"}`}
            onClick={handleConfirmClick}
            disabled={!isApprove && !notes.trim()}
          >
            {isApprove ? (
              <>
                <FiCheck className="btn-icon" /> Xác nhận duyệt
              </>
            ) : (
              <>
                <FiX className="btn-icon" /> Xác nhận từ chối
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
