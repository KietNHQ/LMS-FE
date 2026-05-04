import React from "react";
import { FiCalendar } from "react-icons/fi";
import HistoryCalendar from "./HistoryCalendar";
import "./LessonTimeline.css";

const LessonTimeline = ({ 
  currentLessonTime, 
  onOpenLessonReview, 
  selectedHistoryDate, 
  setSelectedHistoryDate, 
  onOpenCalendar, 
  isCalendarOpen, 
  calendarProps,
  availableReviewDates,
  reviewsForSelectedDate,
  onTodayClick,
  readOnly
}) => {
  return (
    <section className="lesson-timeline" aria-label="Mốc thời gian tiết học">
      <div className="lesson-timeline-header">
        <div className="lesson-timeline-title-wrap">
          <h3>Mốc thời gian tiết học</h3>
          <p>{currentLessonTime}</p>
        </div>

        {!readOnly && (
          <button type="button" className="tc-open-form-btn" onClick={onOpenLessonReview}>
            Đánh giá tiết học
          </button>
        )}
      </div>

      <div className="lesson-history">
        <div className="lesson-history-header">
          <h4>Lịch sử các tiết học đã đánh giá</h4>
          <div className="lesson-history-date-picker">
            <button
              type="button"
              className="lesson-history-calendar-btn"
              onClick={onTodayClick}
              aria-label="Chọn ngày hiện tại"
            >
              <FiCalendar />
            </button>
            <input
              type="date"
              value={selectedHistoryDate}
              onChange={(e) => setSelectedHistoryDate(e.target.value)}
              onMouseDown={(e) => {
                e.preventDefault();
                onOpenCalendar();
              }}
              onFocus={(e) => {
                e.target.blur();
                onOpenCalendar();
              }}
              list="lesson-review-dates"
              aria-label="Chọn ngày đã đánh giá"
              readOnly
            />
            <datalist id="lesson-review-dates">
              {availableReviewDates.map((dateKey) => (
                <option key={dateKey} value={dateKey} />
              ))}
            </datalist>

            {isCalendarOpen && <HistoryCalendar {...calendarProps} />}
          </div>
        </div>

        {reviewsForSelectedDate.length === 0 ? (
          <p className="lesson-history-empty">Ngày này chưa có đánh giá tiết học.</p>
        ) : (
          <ul className="lesson-history-list">
            {reviewsForSelectedDate.map((review) => (
              <li key={review.id} className="lesson-history-item">
                <div className="lesson-history-content">
                  <div className="lesson-history-item-top">
                    <span className="lesson-history-tag">{review.lessonLabel}</span>
                  </div>
                  <p className="lesson-history-time">{review.lessonTime}</p>
                  <p className="lesson-history-attendance">
                    Đi học: <strong>{review.attended}</strong> | Vắng: <strong>{review.absent}</strong>
                  </p>
                  <p className="lesson-history-note">{review.note}</p>
                  <small>{review.createdAt}</small>
                </div>
                <span className="lesson-history-score">{review.score}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default LessonTimeline;
