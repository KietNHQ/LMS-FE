import React from "react";
import Modal from "../../../../../../components/ui/Modal/Modal";
import Select from "../../../../../../components/ui/Select/Select";
import "./LessonReviewModal.css";

const LessonReviewModal = ({ 
  isOpen, 
  onClose, 
  onAddReview, 
  currentLessonLabel, 
  currentLessonTime, 
  attendedToday, 
  absentToday, 
  lessonScore, 
  setLessonScore, 
  lessonNote, 
  setLessonNote 
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Điền thông tin đánh giá tiết học"
      className="tc-lesson-modal"
    >
      <form className="tc-lesson-form" onSubmit={onAddReview}>
        <div className="tc-detail-grid">
          <div>
            <span className="tc-detail-label">Mốc tiết học</span>
            <p className="tc-readonly-value">{currentLessonLabel}</p>
          </div>

          <div>
            <span className="tc-detail-label">Thời gian</span>
            <p className="tc-readonly-value">{currentLessonTime}</p>
          </div>

          <div>
            <span className="tc-detail-label">Điểm danh</span>
            <p className="tc-readonly-value">
              Đi học {attendedToday} - Vắng {absentToday}
            </p>
          </div>

          <div>
            <label className="tc-detail-label" htmlFor="lesson-score">
              Điểm đánh giá
            </label>
            <Select
              variant="custom"
              id="lesson-score"
              value={lessonScore}
              onChange={(e) => setLessonScore(e.target.value)}
              placeholder="-- Chọn xếp loại --"
              options={[
                { value: "A (Tốt)", label: "Tốt (A) • +10đ" },
                { value: "B (Khá)", label: "Khá (B) • +5đ" },
                { value: "C (Trung bình)", label: "Trung bình (C) • 0đ" },
                { value: "D (Yếu)", label: "Yếu (D) • -5đ" }
              ]}
            />
          </div>

          <div className="tc-note-field">
            <label className="tc-detail-label" htmlFor="lesson-note">
              Nhận xét tiết học
            </label>
            <textarea
              id="lesson-note"
              className="tc-textarea"
              value={lessonNote}
              onChange={(e) => setLessonNote(e.target.value)}
              placeholder="Nhập nhận xét về mức độ tập trung, thái độ học tập, tiến độ bài học..."
              rows={4}
              required
            />
          </div>
        </div>

        <button type="submit" className="tc-add-btn">
          Lưu đánh giá
        </button>
      </form>
    </Modal>
  );
};

export default LessonReviewModal;



