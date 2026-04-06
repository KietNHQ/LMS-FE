import React, { useState } from "react";
import Modal from "../../../../../components/ui/Modal/Modal";
import "./ClassDetailSection.css";

const PERIOD_DURATION_MINUTES = 45;
const BREAK_AFTER_PERIOD_2_MINUTES = 15;

const toMinutes = (hours, minutes) => hours * 60 + minutes;

const formatTimeRange = (startMinute, endMinute) => {
  const startHour = String(Math.floor(startMinute / 60)).padStart(2, "0");
  const startMin = String(startMinute % 60).padStart(2, "0");
  const endHour = String(Math.floor(endMinute / 60)).padStart(2, "0");
  const endMin = String(endMinute % 60).padStart(2, "0");

  return `${startHour}:${startMin} - ${endHour}:${endMin}`;
};

const buildSessionSlots = (sessionName, basePeriodNumber, firstStartMinute) => {
  const p1Start = firstStartMinute;
  const p2Start = p1Start + PERIOD_DURATION_MINUTES;
  const p3Start = p2Start + PERIOD_DURATION_MINUTES + BREAK_AFTER_PERIOD_2_MINUTES;
  const p4Start = p3Start + PERIOD_DURATION_MINUTES;
  const p5Start = p4Start + PERIOD_DURATION_MINUTES;

  const starts = [p1Start, p2Start, p3Start, p4Start, p5Start];

  return starts.map((startMinute, index) => {
    const endMinute = startMinute + PERIOD_DURATION_MINUTES;
    return {
      periodNumber: basePeriodNumber + index,
      sessionName,
      startMinute,
      endMinute,
      periodLabel: `Tiết ${basePeriodNumber + index}`,
      timeRange: formatTimeRange(startMinute, endMinute),
    };
  });
};

const MORNING_SLOTS = buildSessionSlots("Buổi sáng", 1, toMinutes(7, 15));
const AFTERNOON_SLOTS = buildSessionSlots("Buổi chiều", 1, toMinutes(13, 15));
const LESSON_SLOTS = [...MORNING_SLOTS, ...AFTERNOON_SLOTS];

const getCurrentLessonInfo = (date) => {
  const currentMinute = toMinutes(date.getHours(), date.getMinutes());

  const matchedSlot = LESSON_SLOTS.find(
    (slot) => currentMinute >= slot.startMinute && currentMinute < slot.endMinute
  );

  if (matchedSlot) {
    return {
      periodLabel: matchedSlot.periodLabel,
      sessionLabel: matchedSlot.sessionName,
      timeRange: matchedSlot.timeRange,
    };
  }

  return {
    periodLabel: "Ngoài khung tiết",
    sessionLabel: date.getHours() < 12 ? "Buổi sáng" : "Buổi chiều",
    timeRange: "",
  };
};

const getTermLabel = (term) => (term === "hk1" ? "Học kỳ 1" : "Học kỳ 2");

const ClassDetailSection = ({ classData }) => {
  const [note, setNote] = useState("");
  const [score, setScore] = useState("");
  const [lessonReviews, setLessonReviews] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentLessonInfo = getCurrentLessonInfo(new Date());

  const handleAddLessonReview = (event) => {
    event.preventDefault();

    if (!note.trim() || !score.trim()) {
      return;
    }

    const now = new Date();
    const lessonInfo = getCurrentLessonInfo(now);

    const newReview = {
      id: Date.now(),
      subject: classData.subject,
      teacher: classData.teacher,
      score: score.trim().toUpperCase(),
      note: note.trim(),
      schoolYear: classData.year,
      term: getTermLabel(classData.term),
      periodLabel: lessonInfo.periodLabel,
      sessionLabel: lessonInfo.sessionLabel,
      periodTime: lessonInfo.timeRange,
      createdAt: now.toLocaleString("vi-VN"),
    };

    setLessonReviews((prev) => [newReview, ...prev]);
    setNote("");
    setScore("");
    setIsDialogOpen(false);
  };

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNote("");
    setScore("");
  };

  const getScoreGrade = (value) => {
    const normalized = (value || "").trim().toUpperCase();

    if (normalized.startsWith("A")) return "a";
    if (normalized.startsWith("B")) return "b";
    if (normalized.startsWith("C")) return "c";
    if (normalized.startsWith("D")) return "d";
    if (normalized.startsWith("F")) return "f";

    return "f";
  };

  return (
    <div className="tc-detail-card">
      <div className="tc-form-toggle-row">
        <button
          type="button"
          className="tc-open-form-btn"
          onClick={openDialog}
        >
          Đánh giá tiết học
        </button>
      </div>

      <Modal
        open={isDialogOpen}
        onClose={closeDialog}
        title="Điền thông tin đánh giá tiết học"
        className="tc-lesson-modal"
      >
        <form className="tc-lesson-form" onSubmit={handleAddLessonReview}>
          <div className="tc-detail-grid">
            <div>
              <span className="tc-detail-label">Môn học</span>
              <p className="tc-readonly-value">{classData.subject}</p>
            </div>

            <div>
              <span className="tc-detail-label">Giáo viên</span>
              <p className="tc-readonly-value">{classData.teacher}</p>
            </div>

            <div>
              <span className="tc-detail-label">Năm học</span>
              <p className="tc-readonly-value">{classData.year}</p>
            </div>

            <div>
              <span className="tc-detail-label">Học kỳ</span>
              <p className="tc-readonly-value">{getTermLabel(classData.term)}</p>
            </div>

            <div>
              <span className="tc-detail-label">Tiết học hiện tại (tự động)</span>
              <p className="tc-readonly-value">{currentLessonInfo.periodLabel}</p>
            </div>

            <div>
              <span className="tc-detail-label">Buổi học</span>
              <p className="tc-readonly-value">{currentLessonInfo.sessionLabel}</p>
            </div>

            <div>
              <label className="tc-detail-label" htmlFor="lesson-score">
                Điểm đánh giá
              </label>
              <input
                id="lesson-score"
                className="tc-input"
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Ví dụ: A+, A, B, C..."
                required
              />
            </div>

            <div className="tc-note-field">
              <label className="tc-detail-label" htmlFor="lesson-note">
                Ghi chú đánh giá lớp hôm nay
              </label>
              <textarea
                id="lesson-note"
                className="tc-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
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

      <div className="tc-lesson-list">
        <h4>Lịch sử đánh giá</h4>
        {lessonReviews.length === 0 ? (
          <p className="tc-empty-review">Chưa có đánh giá tiết học nào.</p>
        ) : (
          <ul>
            {lessonReviews.map((review) => (
              <li key={review.id} className="tc-lesson-item">
                <div className="tc-lesson-item-top">
                  <div className="tc-lesson-meta-line">
                    <span className="tc-meta-label">Môn:</span>
                    <span className="tc-meta-value">{review.subject}</span>
                    <span className="tc-meta-separator">|</span>
                    <span className="tc-meta-label">Giáo viên:</span>
                    <span className="tc-meta-value">{review.teacher}</span>
                  </div>
                  <span className={`tc-score-badge grade-${getScoreGrade(review.score)}`}>
                    {review.score}
                  </span>
                </div>

                <div className="tc-lesson-meta-line tc-lesson-time-line">
                  <span className="tc-meta-label">Năm học:</span>
                  <span className="tc-meta-value">{review.schoolYear}</span>
                  <span className="tc-meta-separator">|</span>
                  <span className="tc-meta-label">Học kỳ:</span>
                  <span className="tc-meta-value">{review.term}</span>
                  <span className="tc-meta-separator">|</span>
                  <span className="tc-meta-label">Tiết:</span>
                  <span className="tc-meta-value">{review.periodLabel}</span>
                  <span className="tc-meta-separator">|</span>
                  <span className="tc-meta-label">Buổi:</span>
                  <span className="tc-meta-value">{review.sessionLabel}</span>
                </div>

                <p className="tc-note-label">Ghi chú:</p>
                <p className="tc-lesson-note">{review.note || "Không có ghi chú"}</p>
                <small>{review.createdAt}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClassDetailSection;