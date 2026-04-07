import React, { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiEdit3, FiSearch, FiX } from "react-icons/fi";
import Modal from "../../../../../components/ui/Modal/Modal";
import "./ClassStudentsSection.css";

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
      periodLabel: `Tiết ${basePeriodNumber + index}`,
      sessionLabel: sessionName,
      startMinute,
      endMinute,
      timeRange: formatTimeRange(startMinute, endMinute),
    };
  });
};

const LESSON_SLOTS = [
  ...buildSessionSlots("Buổi sáng", 1, toMinutes(7, 15)),
  ...buildSessionSlots("Buổi chiều", 1, toMinutes(13, 15)),
];

const getCurrentLessonInfo = (date) => {
  const currentMinute = toMinutes(date.getHours(), date.getMinutes());

  const matchedSlot = LESSON_SLOTS.find(
    (slot) => currentMinute >= slot.startMinute && currentMinute < slot.endMinute
  );

  if (matchedSlot) {
    return {
      periodLabel: matchedSlot.periodLabel,
      sessionLabel: matchedSlot.sessionLabel,
      timeRange: matchedSlot.timeRange,
    };
  }

  return {
    periodLabel: "Ngoài khung tiết",
    sessionLabel: date.getHours() < 12 ? "Buổi sáng" : "Buổi chiều",
    timeRange: "",
  };
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shiftDateKey = (baseDate, dayOffset) => {
  const shifted = new Date(baseDate);
  shifted.setDate(baseDate.getDate() + dayOffset);
  return toDateKey(shifted);
};

const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const ClassStudentsSection = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentReviews, setStudentReviews] = useState({});
  const [studentAttendance, setStudentAttendance] = useState({});
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState("");
  const [isLessonReviewDialogOpen, setIsLessonReviewDialogOpen] = useState(false);
  const [lessonScore, setLessonScore] = useState("");
  const [lessonNote, setLessonNote] = useState("");
  const [lessonReviews, setLessonReviews] = useState(() => {
    const now = new Date();
    const todayKey = toDateKey(now);
    const yesterdayKey = shiftDateKey(now, -1);
    const lastWeekKey = shiftDateKey(now, -7);

    const buildAttendanceSnapshot = (presentCount) =>
      students.reduce((acc, student, index) => {
        acc[student.id] = index < presentCount;
        return acc;
      }, {});

    const buildStudentReviewSnapshot = (text) =>
      students.reduce((acc, student, index) => {
        acc[student.id] = index < 5 ? `${text} (${index + 1})` : "";
        return acc;
      }, {});

    return [
      {
        id: 1,
        lessonLabel: "Hôm nay",
        lessonTime: `Tiết 2, 07:15 - 08:00 - ${now.toLocaleDateString("vi-VN")}`,
        attended: Math.max(students.length - 1, 0),
        absent: Math.min(1, students.length),
        score: "A",
        note: "Lớp học tập trung tốt, chỉ 1 học sinh vắng.",
        reviewDate: todayKey,
        attendanceSnapshot: buildAttendanceSnapshot(Math.max(students.length - 1, 0)),
        studentReviewSnapshot: buildStudentReviewSnapshot("Theo dõi tốt"),
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toLocaleString("vi-VN"),
      },
      {
        id: 2,
        lessonLabel: "Hôm qua",
        lessonTime: `Tiết 3, 08:15 - 09:00 - ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")}`,
        attended: Math.max(students.length - 3, 0),
        absent: Math.min(3, students.length),
        score: "B+",
        note: "Hôm qua vắng hơi nhiều, cần nhắc nhở chuyên cần.",
        reviewDate: yesterdayKey,
        attendanceSnapshot: buildAttendanceSnapshot(Math.max(students.length - 3, 0)),
        studentReviewSnapshot: buildStudentReviewSnapshot("Cần củng cố"),
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleString("vi-VN"),
      },
      {
        id: 3,
        lessonLabel: "Tuần trước",
        lessonTime: `Tiết 5, 14:00 - 14:45 - ${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")}`,
        attended: Math.max(students.length - 5, 0),
        absent: Math.min(5, students.length),
        score: "C+",
        note: "Tiết tuần trước vắng nhiều, tiến độ bài chậm.",
        reviewDate: lastWeekKey,
        attendanceSnapshot: buildAttendanceSnapshot(Math.max(students.length - 5, 0)),
        studentReviewSnapshot: buildStudentReviewSnapshot("Thiếu tập trung"),
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleString("vi-VN"),
      },
    ];
  });
  const [todayLessonInfo, setTodayLessonInfo] = useState(() => getCurrentLessonInfo(new Date()));
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => toDateKey(new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => parseDateKey(toDateKey(new Date())));
  const ITEMS_PER_PAGE = 8;

  const totalStudents = students.length;
  const markedAttendedCount = Object.values(studentAttendance).filter(Boolean).length;
  const attendedToday = markedAttendedCount;
  const absentToday = Math.max(totalStudents - attendedToday, 0);
  const todayLabel = new Date().toLocaleDateString("vi-VN");

  const currentLessonLabel = "Hôm nay";
  const currentLessonTime = `${todayLessonInfo.periodLabel}${todayLessonInfo.timeRange ? `, ${todayLessonInfo.timeRange}` : ""} - ${todayLabel}`;

  const availableReviewDates = useMemo(
    () => [...new Set(lessonReviews.map((review) => review.reviewDate))].sort((a, b) => b.localeCompare(a)),
    [lessonReviews]
  );
  const availableReviewDateSet = useMemo(() => new Set(availableReviewDates), [availableReviewDates]);

  const reviewsForSelectedDate = useMemo(
    () => lessonReviews.filter((review) => review.reviewDate === selectedHistoryDate),
    [lessonReviews, selectedHistoryDate]
  );

  const selectedDateLatestReview = reviewsForSelectedDate[0] || null;

  useEffect(() => {
    if (!selectedDateLatestReview) {
      return;
    }

    setStudentAttendance(selectedDateLatestReview.attendanceSnapshot || {});
    setStudentReviews(selectedDateLatestReview.studentReviewSnapshot || {});
    setCurrentPage(1);
    setEditingStudentId(null);
    setReviewDraft("");
  }, [selectedDateLatestReview]);

  useEffect(() => {
    setCalendarViewDate(parseDateKey(selectedHistoryDate));
  }, [selectedHistoryDate]);

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedStudents = filteredStudents.slice(
    (effectivePage - 1) * ITEMS_PER_PAGE,
    effectivePage * ITEMS_PER_PAGE
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const goPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const startEditReview = (student) => {
    setEditingStudentId(student.id);
    setReviewDraft(studentReviews[student.id] || "");
  };

  const cancelEditReview = () => {
    setEditingStudentId(null);
    setReviewDraft("");
  };

  const saveReview = (studentId) => {
    setStudentReviews((prev) => ({
      ...prev,
      [studentId]: reviewDraft.trim(),
    }));
    setEditingStudentId(null);
    setReviewDraft("");
  };

  const toggleAttendance = (studentId) => {
    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const openLessonReviewDialog = () => {
    setTodayLessonInfo(getCurrentLessonInfo(new Date()));
    setIsLessonReviewDialogOpen(true);
  };

  const closeLessonReviewDialog = () => {
    setIsLessonReviewDialogOpen(false);
    setLessonScore("");
    setLessonNote("");
  };

  const handleAddLessonReview = (event) => {
    event.preventDefault();

    if (!lessonScore.trim() || !lessonNote.trim()) {
      return;
    }

    const reviewDateKey = toDateKey(new Date());
    const attendanceSnapshot = students.reduce((acc, student) => {
      acc[student.id] = !!studentAttendance[student.id];
      return acc;
    }, {});
    const studentReviewSnapshot = students.reduce((acc, student) => {
      acc[student.id] = studentReviews[student.id] || "";
      return acc;
    }, {});

    const newReview = {
      id: Date.now(),
      lessonLabel: currentLessonLabel,
      lessonTime: currentLessonTime,
      attended: attendedToday,
      absent: absentToday,
      score: lessonScore.trim().toUpperCase(),
      note: lessonNote.trim(),
      reviewDate: reviewDateKey,
      attendanceSnapshot,
      studentReviewSnapshot,
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    setLessonReviews((prev) => [newReview, ...prev]);
    setSelectedHistoryDate(reviewDateKey);
    closeLessonReviewDialog();
  };

  const calendarMonthLabel = calendarViewDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const firstOfMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1);
  const daysInMonth = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

  const calendarCells = Array.from({ length: 42 }, (_, idx) => {
    const dayOffset = idx - firstWeekday + 1;
    const dateObj = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), dayOffset);
    const dateKey = toDateKey(dateObj);
    return {
      dateObj,
      dateKey,
      day: dateObj.getDate(),
      isCurrentMonth: dayOffset >= 1 && dayOffset <= daysInMonth,
      isSelected: dateKey === selectedHistoryDate,
      isToday: dateKey === toDateKey(new Date()),
      hasReview: availableReviewDateSet.has(dateKey),
    };
  });

  const openCalendar = () => {
    setCalendarViewDate(parseDateKey(selectedHistoryDate));
    setIsCalendarOpen(true);
  };

  const selectCalendarDate = (dateKey) => {
    setSelectedHistoryDate(dateKey);
    setIsCalendarOpen(false);
  };

  return (
    <div className="students-card">
      <div className="students-card-header">
        <h2 className="students-card-title">Danh sách học sinh</h2>
        <div className="class-detail-search-box">
          <FiSearch className="class-detail-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <section className="lesson-timeline" aria-label="Mốc thời gian tiết học">
        <div className="lesson-timeline-header">
          <div className="lesson-timeline-title-wrap">
            <h3>Mốc thời gian tiết học</h3>
            <p>{currentLessonTime}</p>
          </div>

          <button type="button" className="tc-open-form-btn" onClick={openLessonReviewDialog}>
            Đánh giá tiết học
          </button>
        </div>

        <div className="lesson-history">
          <div className="lesson-history-header">
            <h4>Lịch sử các tiết học đã đánh giá</h4>
            <div className="lesson-history-date-picker">
              <button
                type="button"
                className="lesson-history-calendar-btn"
                onClick={() => setSelectedHistoryDate(toDateKey(new Date()))}
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
                  openCalendar();
                }}
                onFocus={(e) => {
                  e.target.blur();
                  openCalendar();
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

              {isCalendarOpen && (
                <div className="lesson-calendar-popover">
                  <div className="lesson-calendar-header">
                    <button
                      type="button"
                      className="lesson-calendar-nav-btn"
                      onClick={() =>
                        setCalendarViewDate(
                          new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)
                        )
                      }
                      aria-label="Tháng trước"
                    >
                      <FiChevronLeft />
                    </button>
                    <strong>{calendarMonthLabel}</strong>
                    <button
                      type="button"
                      className="lesson-calendar-nav-btn"
                      onClick={() =>
                        setCalendarViewDate(
                          new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)
                        )
                      }
                      aria-label="Tháng sau"
                    >
                      <FiChevronRight />
                    </button>
                  </div>

                  <table className="lesson-calendar-table">
                    <thead>
                      <tr>
                        <th>T2</th>
                        <th>T3</th>
                        <th>T4</th>
                        <th>T5</th>
                        <th>T6</th>
                        <th>T7</th>
                        <th>CN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }, (_, weekIdx) => (
                        <tr key={`week-${weekIdx}`}>
                          {calendarCells.slice(weekIdx * 7, weekIdx * 7 + 7).map((cell) => (
                            <td key={cell.dateKey}>
                              <button
                                type="button"
                                className={`lesson-calendar-day ${cell.isCurrentMonth ? "" : "out-month"} ${
                                  cell.hasReview ? "has-review" : ""
                                } ${cell.isSelected ? "selected" : ""} ${cell.isToday ? "today" : ""}`.trim()}
                                onClick={() => selectCalendarDate(cell.dateKey)}
                              >
                                {cell.day}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {reviewsForSelectedDate.length === 0 ? (
            <p className="lesson-history-empty">Ngày này chưa có đánh giá tiết học.</p>
          ) : (
            <ul className="lesson-history-list">
              {reviewsForSelectedDate.map((review) => (
                <li key={review.id} className="lesson-history-item">
                  <div className="lesson-history-item-top">
                    <span className="lesson-history-tag">{review.lessonLabel}</span>
                    <span className="lesson-history-score">{review.score}</span>
                  </div>
                  <p className="lesson-history-time">{review.lessonTime}</p>
                  <p className="lesson-history-attendance">
                    Đi học: <strong>{review.attended}</strong> | Vắng: <strong>{review.absent}</strong>
                  </p>
                  <p className="lesson-history-note">{review.note}</p>
                  <small>{review.createdAt}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Modal
        open={isLessonReviewDialogOpen}
        onClose={closeLessonReviewDialog}
        title="Điền thông tin đánh giá tiết học"
        className="tc-lesson-modal"
      >
        <form className="tc-lesson-form" onSubmit={handleAddLessonReview}>
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
              <input
                id="lesson-score"
                className="tc-input"
                type="text"
                value={lessonScore}
                onChange={(e) => setLessonScore(e.target.value)}
                placeholder="Ví dụ: A+, A, B, C..."
                required
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

      <div className="table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>STT</th>
              <th className="student-name-header">HỌC SINH</th>
              <th>NGÀY SINH</th>
              <th>PHỤ HUYNH</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>ĐÁNH GIÁ</th>
              <th>ĐIỂM DANH</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student, index) => (
              <tr key={student.id}>
                <td className="student-index-cell">
                  {(effectivePage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                <td className="student-name-cell">
                  <div className="student-main-info">
                    <span className="student-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="student-name">{student.name}</span>
                  </div>
                </td>
                <td className="student-dob">{formatDate(student.dob)}</td>
                <td className="student-parent">{student.parentName}</td>
                <td className="student-phone">{student.parentPhone}</td>
                <td className="student-review-cell">
                  {editingStudentId === student.id ? (
                    <div className="review-editor">
                      <textarea
                        value={reviewDraft}
                        onChange={(e) => setReviewDraft(e.target.value)}
                        placeholder="Nhập đánh giá cho học sinh..."
                        rows={2}
                      />
                      <div className="review-editor-actions">
                        <button
                          type="button"
                          className="review-action-btn save"
                          onClick={() => saveReview(student.id)}
                          aria-label="Lưu đánh giá"
                        >
                          <FiCheck />
                          <span>Lưu</span>
                        </button>
                        <button
                          type="button"
                          className="review-action-btn cancel"
                          onClick={cancelEditReview}
                          aria-label="Hủy đánh giá"
                        >
                          <FiX />
                          <span>Hủy</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="review-display">
                      <p>
                        {studentReviews[student.id]
                          ? studentReviews[student.id]
                          : "Chưa có đánh giá"}
                      </p>
                      <button
                        type="button"
                        className="review-icon-btn"
                        onClick={() => startEditReview(student)}
                        aria-label={`Đánh giá học sinh ${student.name}`}
                      >
                        <FiEdit3 />
                      </button>
                    </div>
                  )}
                </td>
                <td className="student-attendance-cell">
                  <label className="attendance-checkbox">
                    <input
                      type="checkbox"
                      checked={!!studentAttendance[student.id]}
                      onChange={() => toggleAttendance(student.id)}
                      aria-label={`Đi học ${student.name}`}
                    />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="students-pagination">
        <button
          type="button"
          className="page-btn"
          onClick={goPrevPage}
          disabled={effectivePage === 1}
          aria-label="Trang trước"
        >
          ‹
        </button>

        <div className="page-indicator">
          <span>{effectivePage}</span>
          <small>/ {totalPages}</small>
        </div>

        <button
          type="button"
          className="page-btn"
          onClick={goNextPage}
          disabled={effectivePage === totalPages}
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default ClassStudentsSection;