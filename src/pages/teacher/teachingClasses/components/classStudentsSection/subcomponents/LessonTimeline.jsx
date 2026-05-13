import React from "react";
import { FiCalendar, FiEdit2, FiTrash2, FiAlertCircle } from "react-icons/fi";
import HistoryCalendar from "./HistoryCalendar";
import "./LessonTimeline.css";

// Hàm helper kiểm tra xem có đánh giá muộn không
const checkIsLate = (lessonTimeStr, createdAtStr) => {
  if (!lessonTimeStr || !createdAtStr) return false;
  
  try {
    // Parse lesson start time (e.g., "07:30 - 13/5/2026")
    const [timePart, datePart] = lessonTimeStr.split(" - ");
    const [hours, mins] = timePart.split(":").map(Number);
    const [day, month, year] = datePart.split("/").map(Number);
    
    const lessonStart = new Date(year, month - 1, day, hours, mins);
    // Giả định tiết học dài 45 phút, cho phép trễ thêm 15 phút (tổng 60p từ lúc bắt đầu)
    const deadline = new Date(lessonStart.getTime() + 60 * 60000); 
    
    // Parse createdAt (e.g., "13:44:00 13/5/2026")
    const [cTime, cDate] = createdAtStr.split(" ");
    const [ch, cm, cs] = cTime.split(":").map(Number);
    const [cd, cmoth, cy] = cDate.split("/").map(Number);
    const createdDate = new Date(cy, cmoth - 1, cd, ch, cm, cs);
    
    return createdDate > deadline;
  } catch (e) {
    return false;
  }
};

const LessonTimeline = ({ 
  currentLessonTime, 
  onOpenLessonReview, 
  selectedHistoryDate, 
  setSelectedHistoryDate, 
  onToggleCalendar, 
  isCalendarOpen, 
  calendarProps,
  availableReviewDates,
  reviewsForSelectedDate,
  onTodayClick,
  onEditLessonReview,
  onDeleteLessonReview,
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
              onClick={(e) => {
                // If it's already today, just toggle. 
                // If it's not today, go to today AND open.
                const today = new Date().toISOString().split('T')[0];
                if (selectedHistoryDate !== today) {
                   onTodayClick();
                   if (!isCalendarOpen) onToggleCalendar();
                } else {
                   onToggleCalendar();
                }
              }}
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
                onToggleCalendar();
              }}
              onFocus={(e) => {
                e.target.blur();
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
            {reviewsForSelectedDate.map((review) => {
              const isLate = checkIsLate(review.lessonTime, review.createdAt);
              
              return (
                <li key={review.id} className={`lesson-history-item ${isLate ? 'is-late' : ''}`}>
                  <div className="lesson-history-content">
                    <div className="lesson-history-item-top">
                      <span className="lesson-history-tag">
                        {review.lessonLabel}
                        {isLate && (
                          <span className="late-badge">
                            <FiAlertCircle size={12} /> Đánh giá muộn
                          </span>
                        )}
                      </span>
                    </div>

                    <p className="lesson-history-time">{review.lessonTime}</p>
                    <p className="lesson-history-attendance">
                      Đi học: <strong>{review.attended}</strong> | Vắng: <strong>{review.absent}</strong>
                    </p>
                    
                    {review.studentReports && review.studentReports.length > 0 && (
                      <div className="lesson-history-reports">
                        <strong>Ghi nhận học sinh:</strong>
                        <ul className="lesson-history-reports-list">
                          {review.studentReports.map((report, idx) => (
                            <li key={idx} className="lesson-history-report-item">
                              • {report.surname || ""} {report.given_name || ""}: {report.category} - {typeof report.content === 'object' ? (report.content.label || "N/A") : report.content} ({report.points > 0 ? "+" : ""}{report.points}đ)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="lesson-history-note">{review.note}</p>
                    
                    {isLate && (
                      <div className="late-remind-info">
                        <FiAlertCircle size={14} />
                        Hệ thống ghi nhận đánh giá này thực hiện muộn hơn thời gian dạy dự kiến.
                      </div>
                    )}

                    <small className="lesson-history-created-at">
                      Thời gian ghi nhận: {review.createdAt}
                    </small>
                  </div>

                  {!readOnly && (
                    <div className="lesson-history-right-col">
                      <div className="lesson-history-actions">
                        <button 
                          className="lesson-history-action-btn edit" 
                          onClick={() => onEditLessonReview(review)}
                          title="Sửa đánh giá"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          className="lesson-history-action-btn delete" 
                          onClick={() => onDeleteLessonReview(review.id)}
                          title="Xóa đánh giá"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                      
                      <div className={`lesson-history-score ${review.score?.charAt(0).toLowerCase() || 'a'}`}>
                        {review.score}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default LessonTimeline;

