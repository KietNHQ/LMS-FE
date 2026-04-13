import React, { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import "./ClassStudentsSection.css";

// Utilities
import {
  getCurrentLessonInfo,
  toDateKey,
  shiftDateKey,
  parseDateKey,
  REVIEW_CONTENT_MAPPING,
  normalizeStoredReview,
} from "../../utils/teachingClassesUtils";

// Sub-components
import LessonTimeline from "./subcomponents/LessonTimeline";
import StudentReviewModal from "./subcomponents/StudentReviewModal";
import LessonReviewModal from "./subcomponents/LessonReviewModal";
import StudentsTable from "./subcomponents/StudentsTable";
import Pagination from "./subcomponents/Pagination";

const ITEMS_PER_PAGE = 8;

const ClassStudentsSection = ({ students }) => {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [studentReviews, setStudentReviews] = useState({});
  const [studentAttendance, setStudentAttendance] = useState({});
  
  // Student Review Modal State
  const [reviewDialogStudent, setReviewDialogStudent] = useState(null);
  const [reviewCategory, setReviewCategory] = useState("Vi phạm: Chuyên cần");
  const [reviewContent, setReviewContent] = useState(REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewEntries, setReviewEntries] = useState([]);
  
  // Lesson Review Modal State
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

  // Timeline & Calendar State
  const [todayLessonInfo, setTodayLessonInfo] = useState(() => getCurrentLessonInfo(new Date()));
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => toDateKey(new Date()));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => parseDateKey(toDateKey(new Date())));

  // --- Derived State ---
  const totalStudents = students.length;
  const markedAttendedCount = Object.values(studentAttendance).filter(Boolean).length;
  const attendedToday = markedAttendedCount;
  const absentToday = Math.max(totalStudents - attendedToday, 0);
  const todayLabel = new Date().toLocaleDateString("vi-VN");

  const currentLessonLabel = `Tiết học ${lessonReviews.length + 1}`;
  const currentLessonTime = `${todayLessonInfo.periodLabel === "Ngoài khung tiết" ? "Tiết 1" : todayLessonInfo.periodLabel} - ${todayLabel}`;

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

  const filteredStudents = students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedStudents = filteredStudents.slice(
      (effectivePage - 1) * ITEMS_PER_PAGE,
      effectivePage * ITEMS_PER_PAGE
  );

  const reviewTotalPoints = useMemo(
    () => reviewEntries.reduce((total, entry) => total + entry.pts, 0),
    [reviewEntries]
  );

  // --- Effects ---
  useEffect(() => {
    if (!selectedDateLatestReview) return;
    setStudentAttendance(selectedDateLatestReview.attendanceSnapshot || {});
    setStudentReviews(selectedDateLatestReview.studentReviewSnapshot || {});
    setCurrentPage(1);
  }, [selectedDateLatestReview]);

  useEffect(() => {
    setCalendarViewDate(parseDateKey(selectedHistoryDate));
  }, [selectedHistoryDate]);

  // --- Handlers ---
  const handleBackToToday = () => setSelectedHistoryDate(toDateKey(new Date()));

  const openReviewDialog = (student) => {
    setReviewDialogStudent(student);
    const existingReview = normalizeStoredReview(studentReviews[student.id]);

    setReviewCategory("Vi phạm: Chuyên cần");
    setReviewContent(REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
    setReviewNote("");
    setReviewEntries(existingReview?.entries || []);

    if (existingReview?.entries?.length > 0) {
      const firstEntry = existingReview.entries[0];
      setReviewCategory(firstEntry.category || "Vi phạm: Chuyên cần");
      setReviewContent(firstEntry.content || REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
      setReviewNote(firstEntry.note || "");
    }
  };

  const closeReviewDialog = () => {
    setReviewDialogStudent(null);
    setReviewCategory("Vi phạm: Chuyên cần");
    setReviewContent(REVIEW_CONTENT_MAPPING["Vi phạm: Chuyên cần"][0]);
    setReviewNote("");
    setReviewEntries([]);
  };

  const handleReviewCategoryChange = (category) => {
    setReviewCategory(category);
    setReviewContent(REVIEW_CONTENT_MAPPING[category][0]);
  };


  const addReviewEntry = () => {
    setReviewEntries((currentEntries) => [
      ...currentEntries,
      {
        id: Date.now(),
        category: reviewCategory,
        content: reviewContent,
        note: reviewNote.trim(),
        pts: reviewContent.pts,
      },
    ]);
    setReviewNote("");
  };

  const removeReviewEntry = (entryId) => {
    setReviewEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId));
  };

  const saveReview = () => {
    if (!reviewDialogStudent) return;

    const entriesToSave = reviewEntries.length > 0 ? reviewEntries : [
      {
        id: Date.now(),
        category: reviewCategory,
        content: reviewContent,
        note: reviewNote.trim(),
        pts: reviewContent.pts,
      },
    ];

    const totalPoints = entriesToSave.reduce((total, entry) => total + entry.pts, 0);

    const reviewText = [
      entriesToSave
          .map((entry) => {
            const pointLabel = entry.pts > 0 ? `+${entry.pts}` : entry.pts;
            return [entry.category, entry.content.label, entry.note, `Điểm: ${pointLabel}`].filter(Boolean).join(" • ");
          })
          .join(" || "),
      `Tổng: ${totalPoints > 0 ? `+${totalPoints}` : totalPoints}`,
    ].filter(Boolean).join(" • ");

    setStudentReviews((prev) => ({
      ...prev,
      [reviewDialogStudent.id]: {
        summary: reviewText,
        entries: entriesToSave,
        totalPoints,
      },
    }));
    closeReviewDialog();
  };

  const toggleAttendance = (studentId) => {
    setStudentAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleAddLessonReview = (event) => {
    event.preventDefault();
    if (!lessonScore.trim() || !lessonNote.trim()) return;

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
    setIsLessonReviewDialogOpen(false);
    setLessonScore("");
    setLessonNote("");
  };

  // Calendar Helpers
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

  return (
    <div className="students-card">
      <div className="students-card-header">
        <h2 className="students-card-title">Danh sách & đánh giá</h2>
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

      <LessonTimeline 
        currentLessonTime={currentLessonTime}
        onOpenLessonReview={() => setIsLessonReviewDialogOpen(true)}
        selectedHistoryDate={selectedHistoryDate}
        setSelectedHistoryDate={setSelectedHistoryDate}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        isCalendarOpen={isCalendarOpen}
        availableReviewDates={availableReviewDates}
        reviewsForSelectedDate={reviewsForSelectedDate}
        onTodayClick={handleBackToToday}
        calendarProps={{
          calendarMonthLabel,
          calendarViewDate,
          setCalendarViewDate,
          calendarCells,
          onSelectDate: (dateKey) => {
            setSelectedHistoryDate(dateKey);
            setIsCalendarOpen(false);
          }
        }}
      />

      <StudentReviewModal 
        student={reviewDialogStudent}
        onClose={closeReviewDialog}
        reviewCategory={reviewCategory}
        onCategoryChange={handleReviewCategoryChange}
        reviewContent={reviewContent}
        onContentChange={setReviewContent}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        reviewEntries={reviewEntries}
        onAddEntry={addReviewEntry}
        onRemoveEntry={removeReviewEntry}
        reviewTotalPoints={reviewTotalPoints}
        onSave={saveReview}
      />

      <LessonReviewModal 
        isOpen={isLessonReviewDialogOpen}
        onClose={() => setIsLessonReviewDialogOpen(false)}
        onAddReview={handleAddLessonReview}
        currentLessonLabel={currentLessonLabel}
        currentLessonTime={currentLessonTime}
        attendedToday={attendedToday}
        absentToday={absentToday}
        lessonScore={lessonScore}
        setLessonScore={setLessonScore}
        lessonNote={lessonNote}
        setLessonNote={setLessonNote}
      />

      <StudentsTable 
        students={paginatedStudents}
        studentAttendance={studentAttendance}
        onToggleAttendance={toggleAttendance}
        onOpenReview={openReviewDialog}
        effectivePage={effectivePage}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      <Pagination 
        effectivePage={effectivePage}
        totalPages={totalPages}
        onPrevPage={() => setCurrentPage(p => Math.max(1, p - 1))}
        onNextPage={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      />
    </div>
  );
};

export default ClassStudentsSection;


