import React from "react";
import { FiCheck } from "react-icons/fi";
import Modal from "../../../../../../components/ui/Modal/Modal";
import Select from "../../../../../../components/ui/Select/Select";
import { REVIEW_CONTENT_MAPPING } from "../../../utils/teachingClassesUtils";
import "./StudentReviewModal.css";

const StudentReviewModal = ({ 
  student, 
  onClose, 
  reviewCategory, 
  onCategoryChange, 
  reviewContent, 
  onContentChange, 
  reviewNote, 
  setReviewNote, 
  reviewEntries, 
  onAddEntry, 
  onRemoveEntry, 
  reviewTotalPoints, 
  onSave,
  readOnly,
  bulkCount = 0
}) => {
  const isOpen = !!student || bulkCount > 0;
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={readOnly ? "Thông tin ghi nhận" : "Điền thông tin ghi nhận"}
      className="tc-review-modal"
    >
      <div className="tc-review-dialog-content">
        <div className="tc-review-dialog-student">
          <div className="tc-review-dialog-avatar">
            {student ? student.name.charAt(0).toUpperCase() : bulkCount}
          </div>
          <div className="tc-review-dialog-student-info">
            <div className="tc-review-dialog-student-title-row">
              <h4>{student ? student.name : `Đánh giá cho ${bulkCount} học sinh`}</h4>
              <span className={`tc-review-dialog-score-badge ${reviewTotalPoints >= 0 ? "positive" : "negative"}`}>
                {reviewTotalPoints > 0 ? `+${reviewTotalPoints}` : reviewTotalPoints} điểm
              </span>
            </div>
            <p>
              {student ? `${student.parentName} • ${student.parentPhone}` : "Áp dụng đánh giá hàng loạt cho các mục đã chọn"}
            </p>
          </div>
        </div>

        <div className="tc-review-dialog-grid">
          {!readOnly && (
            <>
              <div className="tc-review-dialog-field">
                <label className="tc-detail-label" htmlFor="review-category">
                  Nhóm ghi nhận
                </label>
                <Select
                  variant="custom"
                  id="review-category"
                  value={reviewCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  options={Object.keys(REVIEW_CONTENT_MAPPING).map((category) => ({
                    value: category,
                    label: category
                  }))}
                />
              </div>

              <div className="tc-review-dialog-field">
                <label className="tc-detail-label" htmlFor="review-content">
                  Nội dung
                </label>
                {reviewCategory === "Đánh giá thường xuyên (Điểm miệng)" ? (
                  <input
                    id="review-content"
                    className="tc-input"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={reviewContent.label.replace("Điểm ", "")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 10)) {
                        onContentChange({ label: `Điểm ${val}`, pts: 0 });
                      }
                    }}
                    placeholder="Nhập điểm (0-10)..."
                  />
                ) : (
                  <Select
                    variant="custom"
                    id="review-content"
                    value={reviewContent.label}
                    onChange={(e) => {
                      const nextContent = REVIEW_CONTENT_MAPPING[reviewCategory].find(
                        (item) => item.label === e.target.value
                      );
                      if (nextContent) {
                        onContentChange(nextContent);
                      }
                    }}
                    options={REVIEW_CONTENT_MAPPING[reviewCategory].map((item) => ({
                      value: item.label,
                      label: item.label
                    }))}
                  />
                )}
              </div>

              <div className="tc-review-dialog-field tc-review-dialog-field--full">
                <label className="tc-detail-label" htmlFor="review-note">
                  Ghi chú
                </label>
                <input
                  id="review-note"
                  className="tc-input"
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Nhập ghi chú bổ sung..."
                />
              </div>
            </>
          )}

          <div className="tc-review-dialog-field tc-review-dialog-field--full tc-review-dialog-entry-box">
            <div className="tc-review-dialog-entry-box-top">
              <span className="tc-detail-label">ghi nhận đã chọn</span>
              {!readOnly && (
                <button type="button" className="tc-review-dialog-add-entry-btn" onClick={onAddEntry}>
                  Thêm ghi nhận
                </button>
              )}
            </div>

            {reviewEntries.length === 0 ? (
              <p className="tc-review-dialog-entry-empty">
                {readOnly ? "Học sinh này chưa có ghi nhận nào trong tiết học này." : "Chọn nhóm ghi nhận, nội dung và ghi chú nếu cần, sau đó bấm thêm để tạo nhiều ô đánh giá."}
              </p>
            ) : (
              <div className="tc-review-dialog-entry-list">
                {reviewEntries.map((entry) => {
                  const pointLabel = entry.pts > 0 ? `+${entry.pts}` : entry.pts;

                  return (
                    <div key={entry.id} className="tc-review-dialog-entry-card">
                      <div className="tc-review-dialog-entry-card-main">
                        <strong>{entry.category}</strong>
                        <span>{entry.content.label}</span>
                        {entry.note ? <small>{entry.note}</small> : null}
                      </div>
                      <div className="tc-review-dialog-entry-card-side">
                        <span className={`tc-review-dialog-score-badge ${entry.pts >= 0 ? "positive" : "negative"}`}>
                          {pointLabel} điểm
                        </span>
                        {!readOnly && (
                          <button
                            type="button"
                            className="tc-review-dialog-entry-remove"
                            onClick={() => onRemoveEntry(entry.id)}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="tc-review-dialog-entry-total">
              Tổng điểm hiện tại: {reviewTotalPoints > 0 ? `+${reviewTotalPoints}` : reviewTotalPoints}
            </p>
          </div>
        </div>

        <div className="tc-review-dialog-actions">
          <button type="button" className="tc-review-dialog-btn secondary" onClick={onClose}>
            {readOnly ? "Đóng" : "Hủy"}
          </button>
          {!readOnly && (
            <button type="button" className="tc-review-dialog-btn primary" onClick={onSave}>
              <FiCheck />
              Lưu ghi nhận
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StudentReviewModal;




